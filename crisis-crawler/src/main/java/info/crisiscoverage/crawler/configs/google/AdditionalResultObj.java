package info.crisiscoverage.crawler.configs.google;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import info.crisiscoverage.crawler.CrawlerConstants.Column;
import info.crisiscoverage.crawler.CrawlerConstants.MetaMode;
import info.crisiscoverage.crawler.configs.google.AbstractGoogleConfig.DateRestrict;

public class AdditionalResultObj {
	
	/** What is the MetaMode? */
	final protected MetaMode metaMode;
	
	/** What are the row headers that are in play */
	final protected List<Column> rowHeaders;
	
	final protected Integer rawResultIdx;
	final protected Integer periodsBackIdx;
	
	/** What are the result headers that are in play */
	final protected List<String> resultHeaders;
	
	final protected Integer comparedResultIdx;
	
	/** What is the value of the query distinct key that should be tested when populating this object*/
	final protected String queryDistinctKey;
	
	/** What is the Period*/
	final protected DateRestrict dateRestrict;
	
	/** Key is the PERIOD, value is the row. */
	final protected Map<Integer,List<String>> rowPeriodValMap = new TreeMap<>();
	
	/** Key is the PERIOD, value is the 'raw_result_count' */
	final protected Map<Integer,Integer> periodRawResultMap = new TreeMap<>();
	
	/** Key is the PERIOD, value is the 'compared_result_count' NOTE: THIS WILL BE REGENERATED UPON REQUEST. */
	final protected Map<Integer,Integer> periodCompareResultMap = new TreeMap<>();
	
	protected int minPeriod = -1;
	protected int maxPeriod = -1;
	
	/**
	 * Constructor.
	 * @param metaMode
	 * @param queryDistinctKey
	 * @param dateRestrict
	 * @param rowHeaders
	 * @param resultHeaders
	 * @throws Exception
	 */
	public AdditionalResultObj(MetaMode metaMode,
			String queryDistinctKey, DateRestrict dateRestrict, List<Column> rowHeaders, List<String> resultHeaders) throws Exception{
		this.metaMode = metaMode;
		this.queryDistinctKey = queryDistinctKey;
		this.dateRestrict = dateRestrict;
		this.rowHeaders = rowHeaders;
		this.resultHeaders = resultHeaders;
		
		//Save time by 1x getting rowHeader indexes.
		rawResultIdx = Integer.valueOf(rowHeaders.indexOf(Column.raw_result_count));
		periodsBackIdx = Integer.valueOf(rowHeaders.indexOf(Column.periods_back));
		
		//Save time by 1x getting resultHeader indexes.
		comparedResultIdx = Integer.valueOf(resultHeaders.indexOf(Column.compared_result_count.toString()));
	}
	
	/**
	 * Test for what modes should be run.
	 * @param metaMode
	 * @return
	 */
	public boolean isForMetaMode(){
		switch(metaMode){
		case query_stats_with_distinct: return true;
		default:
			return false;
		}
	}
	
	/**
	 * Test for which modes are using period compare results.
	 * @param metaMode
	 * @return
	 */
	public boolean isUsingPeriodCompareResults(){
		switch(metaMode){
		case query_stats_with_distinct: return true;
		default:
			return false;
		}
	}
	
	/**
	 * Add a row, assumes acceptance testing already done.
	 * @param metaMode
	 * @param row
	 */
	public void addRowToPeriodValMap(List<String> row){
		if (!isForMetaMode()) return;
		
		if (isUsingPeriodCompareResults()){
			String rawPeriod = row.get(periodsBackIdx.intValue());

			try{
				int p =Integer.parseInt(rawPeriod.trim());

				String rawResult = row.get(rawResultIdx.intValue()); 
				int r =Integer.parseInt(rawResult.trim());

				rowPeriodValMap.put(p,row);
				periodRawResultMap.put(p, r);

				if (minPeriod < 1 || p < minPeriod) minPeriod = p;
				if (maxPeriod < 1 || p > maxPeriod) maxPeriod = p;

				System.out.println("... for '"+queryDistinctKey+"', adding row with period: "+p+", rawResult: "+r);
				return;
			} catch(Exception e){
				e.printStackTrace();
			}

			System.err.println("... unable to add row at #"+rowPeriodValMap.size()+", run acceptance test first -- isAcceptedByQueryDistinctKey().");
		} else {
			rowPeriodValMap.put(1,row);//Assumes distinct key
		}
	}
	
	/**
	 * This is the heavy-lifting. Go through the rowPeriodValMap and determine the additional column(s) and add it to the list.
	 * @param headers
	 * @return List<Map<Column,String>>
	 */
	public List<Map<String,String>> populateAdditionalResult(){
		
		List<Map<String,String>> rows = new ArrayList<>();
		
		if (!isForMetaMode()) return rows;
		
			System.out.println("--> Populating additional result for metaMode: "+metaMode+", minPeriod: "+minPeriod+", maxPeriod: "+maxPeriod);

			if (isUsingPeriodCompareResults() && minPeriod > 0 && maxPeriod > 0){

				//Figure out the compare values.
				periodCompareResultMap.clear();

				for(int i = maxPeriod; i >= minPeriod; i--){
					System.out.println("i: "+i);
					int raw = periodRawResultMap.get(Integer.valueOf(i)); 
					int r = raw;
					if (i+1 <=maxPeriod){
						r = raw - periodRawResultMap.get(Integer.valueOf(i+1));
					}
					System.out.println("... for queryDistinctKey: "+queryDistinctKey+" at period: "+i+", compare_result_count: "+r+
							", raw_result_count: '"+raw+"' ... dateRestrict: "+dateRestrict.name());

					periodCompareResultMap.put(Integer.valueOf(i), Integer.valueOf(r));
				}

			} else if (isUsingPeriodCompareResults()) {
				System.err.println("WARNING ::: invalid minPeriod and/or maxPeriod, skipping 'compared_result_count' population.");
				return rows;
			}
			
			//Add the columns
			for (Map.Entry<Integer,List<String>> entry : rowPeriodValMap.entrySet()){
				Integer p = entry.getKey();
				List<String> row = entry.getValue();
				rows.add(adjustToResultColumns(row,p));
			}

			return rows;
	}
	
	/**
	 * Populate the Map with columns requested by results.
	 * @param row
	 * @param period
	 * @return Map<Object, String> where k: is Column OR String custom header.
	 */
	final protected Map<String,String> adjustToResultColumns(List<String> row, Integer period){
		
		Map<String,String> map = new HashMap<>();

		for (String header : resultHeaders){
			String v = ""; 

			Column c = null;
			try{
				c = Column.valueOf(header);
			} catch(Exception e){
//				System.err.println("... header: '"+header+"' not determined to be a Column");
			}
			
			if(c != null){
				if (c.equals(Column.compared_result_count)){
					Integer vI = periodCompareResultMap.get(period);
					if (vI != null){
						v = vI.toString();
					} else System.err.println("... no compared_result_count found.");
				} else {
					int idx = rowHeaders.indexOf(c);
					if (idx > -1){
						v = row.get(idx);
					}
				}
				System.out.println("... adding standard column: "+c+", value: "+v);
				map.put(c.name(),v == null? "" : v);
			} 
			//HANDLE CUSTOM CELL VALUES HERE
			else{
				v = getCustomCellValueFor(header, row);
				System.out.println("... adding custom header: "+header+", value: "+v);
				map.put(header, v == null? "" : v);
			}			
		}        
		
		return map;
	}
	
	/**
	 * Sub-Classes can implement this to do something with result headers that are not from {@link Column}.
	 * @param resultHeader
	 * @param row
	 * @return
	 */
	protected String getCustomCellValueFor(String resultHeader, List<String> row){
		return "";
	}

	public String getQueryDistinctKey() {
		return queryDistinctKey;
	}

	public DateRestrict getDateRestrict() {
		return dateRestrict;
	}

	public Map<Integer, List<String>> getRowPeriodValMap() {
		return rowPeriodValMap;
	}

}
