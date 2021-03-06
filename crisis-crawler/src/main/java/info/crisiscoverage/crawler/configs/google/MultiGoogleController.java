package info.crisiscoverage.crawler.configs.google;

import info.crisiscoverage.crawler.CrawlerConstants;
import info.crisiscoverage.crawler.configs.google.MultiQueryObjFactory.MultiType;

/**
 * This is the entry-point class for configuring and running crisis actions.
 * @author mjohns
 */
public class MultiGoogleController implements CrawlerConstants{
	
	protected final String collectionName;
	protected final String crisisQuery;
	protected final int crisisYear;
	protected final int crisisMonth;
	protected final int crisisDay;
	
	/**
	 * Construct with crisis particulars. Run from {@link #main(String[])}.
	 * @param collectionName
	 * @param crisisYear
	 * @param crisisMonth
	 * @param crisisDay
	 * @param crisisQuery
	 */
	public MultiGoogleController(String collectionName, int crisisYear, int crisisMonth, int crisisDay, String crisisQuery){
		this.collectionName = collectionName;
		this.crisisYear = crisisYear;
		this.crisisMonth = crisisMonth;
		this.crisisDay = crisisDay;
		this.crisisQuery = crisisQuery;
	}
	
	/**
	 * Entry-point to run config operations.
	 * @param args
	 * @throws Exception
	 */
	public static void main(String[] args) throws Exception {
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//MULTI-SITE GOOGLE CONFIG
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		/** CONFIG-1: PICK CRISIS {{ */
//		MultiGoogleController crisis = new MultiGoogleController(
//				"haiyan", 2013,11,7,"news OR article OR coverage OR Yolanda \"typhoon haiyan\"");
//		MultiGoogleController crisis = new MultiGoogleController(
//				"turkish-revolt", 2013,5,28,"news OR article OR coverage turkish revolt");
//		MultiGoogleController crisis = new MultiGoogleController(
//				"ukraine-protest", 2014,02,18,"news OR article OR coverage ukraine protest");
		MultiGoogleController crisis = new MultiGoogleController(
				"pakistan-drought", 2014,01,01,"news OR article OR coverage pakistan drought");
		/** }} */	
		
		/** CONFIG-2: CONSTRUCT MultiQueryObj {{ */
//		MultiType multiType = MultiType.media_baseline;
//		MultiType multiType = MultiType.media;
		MultiType multiType = MultiType.country;
		
		boolean isPaidQuery = true;	
		MultiQueryObj msq = MultiQueryObjFactory.create(
				multiType, crisis.collectionName, crisis.crisisYear, crisis.crisisMonth, crisis.crisisDay, crisis.crisisQuery, isPaidQuery);
		/** }} */
		
		/** CONFIG-3 ::: IS THIS ***REALLY*** A LIVE RUN ??? */
		AbstractGoogleConfig.dryRun = false;
		
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ACTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		
/** STEP-1: QUERY GOOGLE API */	
		
		//msq.setOnlyRunPadPeriods(true);
//		msq.setApiKeyStartFrom(0);
//		msq.setMediaStartFrom(0);
//		msq.setMediaGoTo(0);//USE '0', IF ONLY WANT TO USE GOOGLE ???
//		msq.setSpecialParamStartFrom(131);
//		msq.setSpecialParamGoTo(131);
//		msq.getConfig().runMultiQuery(msq); 

/** STEP-2 VERIFY THAT LIVE FILES WERE PROPER XML (MANUAL SAVE ACTIONS OR INTERRUPTED DOWNLOADS CAN INTRODUCE ERROR)
 *  NOTICE ::: RECOMMENDED RUNNING THIS STEP PRIOR TO RUNNING SUBSEQUENT STEPS. 
 */
//		msq.getConfig().verifyLiveApiFiles(true);
		
/** STEP-3: BREAK OUT INDIVIDUAL RESULTS; (OPTIONALLY CRAWL) */		
//		if (multiType.equals(MultiType.media)) msq.setCrawl(true);
//		msq.getConfig().extractFromApiDir(msq.isArchive(), msq.isCrawl());

/** STEP-4: (OPTION): CLEAN TEXT IF CRAWLING WAS TURNED ON IN #2 */	
//		if (multiType.equals(MultiType.media)) msq.getConfig().cleanText(true);		
		
/** STEP-5: GENERATE META CSV FILE VARIATIONS -- NOTE: FOR PRODUCTION, NOT NECESSARILY GENERATING THE TEXT VARIANTS */		
//		if (multiType.equals(MultiType.country)) 
//			msq.getConfig().metaToTable(MetaMode.query_stats_with_distinct, true, defaultValLimit, "stats", false);
//		else msq.getConfig().metaToTable(MetaMode.query_stats_with_distinct, true, defaultValLimit, "stats", true);
//		
//		if (multiType.equals(MultiType.media))
//			msq.getConfig().metaToTable(MetaMode.entries_no_text, true, defaultValLimit, "results_subset", true);
//		
//		if (AbstractGoogleConfig.dryRun) System.err.println("\n!!! THIS WAS A DRY RUN, TURN OFF 'AbstractGoogleConfig.dryRun' FOR ACTUAL !!!\n");
	}
}