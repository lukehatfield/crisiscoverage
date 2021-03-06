package info.crisiscoverage.crawler;

import info.crisiscoverage.crawler.rule.ParseObj;
import info.crisiscoverage.crawler.rule.html.AttributeSelectRule;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.jsoup.nodes.Entities.EscapeMode;
import org.jsoup.safety.Cleaner;
import org.jsoup.safety.Whitelist;

public interface CrawlerConstants {
	
	/**
	 * Most useful for {@link RuleController}.
	 * @author mjohns
	 */
	public static enum RuleType{
		parser,meta;
	}
	
	/**
	 * Cue for {@link ParseObj} handling as to which input or result is prioritized for return, depends on variable.
	 * @author mjohns
	 */
	public static enum WhichOne{
		none_valid, special_string, object;
	}
	
	/**
	 * Useful for {@link ParseRule} handling.
	 * This attempts to be generic enough for any format specific parsing.
	 * The order provided is the stage order as well.
	 * @author mjohns
	 */
	public static enum ParseStage{
		init, orig_string, orig_object, clean_object, clean_string, no_next;
		
		public ParseStage nextStage(){
			switch(this){
			case init: return orig_string;
			case orig_string: return orig_object;
			case orig_object: return clean_object;
			case clean_object: return clean_string;
			case clean_string: 
			default:
				return no_next;
			}
		}
		
		public boolean isStringStage(){
			switch(this){
			case orig_string:
			case clean_string: return true;
			default: 
				return false;
			}
		}
		
		public boolean isObjectStage(){
			switch(this){
			case orig_object:
			case clean_object: return true;
			default: 
				return false;
			}
		}
		
		public boolean isValid(){
			switch(this){
			case init:
			case no_next: return false;
			default: 
				return true;
			}
		}
		
		public static ParseStage getFirstStage(){
			return orig_string;
		}
		
		public static ParseStage getLastStage(){
			return clean_string;
		}
	}
	
	/**
	 * Useful for {@link ParseObj} handling.
	 * This attempts to be generic enough for any parsing from string to object and some variations of need. 
	 * @author mjohns
	 */
	public static enum ParseResultReturn{
	 text_value, unstructured_text, structured_text, structured_text_full, object, objects, object_full;
	}
	
	/**
	 * Useful when only printing a sample from a String.
	 * Most useful for {@link ParseRule}
	 * @author mjohns
	 */
	public static enum StringSample{
		begin_only, end_only, begin_and_end;
	}
	
	/**
	 * What mode is meta in for output.
	 * @author mjohns
	 */
	public static enum MetaMode{
		query_stats_only, query_stats_with_distinct, entries_no_text, entries_with_text;
		
		public boolean isCleanTextMode(){
			switch(this){
			case entries_with_text: return true;
			default: 
				return false;
			}
		}
		
		public boolean isQueryStatsMode(){
			switch(this){
			case query_stats_only:
			case query_stats_with_distinct:	
				return true;
			default: 
				return false;
			}
		}
		
		public boolean isWithQuery(){
			switch(this){
			case query_stats_with_distinct: return true;
			default: 
				return false;
			}
		}
	}
	
	/**
	 * Columns used in csv generation of available data /  metadata.
	 * Most useful for {@link MetaMapper}
	 * @author mjohns
	 */
	public static enum Column{
		query_distinct,query_run_date,query_period,periods_back,days_back,raw_result_count,compared_result_count,date_query_start,date_query_end,
		doc_id,domain,title,date_published,collection,tags,url,summary,clean_text;
		
		public boolean isQueryAndResultColumn(){
			switch(this){
			case query_distinct:
			case query_run_date:
			case query_period:
			case periods_back:
			case days_back:
			case raw_result_count:
			case compared_result_count:
			case date_query_start:
			case date_query_end:
				return true;
			default:
				return false;
			}
		}
		
		public static void removeQueryAndResultColumns(Map<Column,String> map){
			if (map == null) return;
			for (Column c : Column.values()){
				if (c.isQueryAndResultColumn()) map.remove(c);
			}
		}
		
		public static void removeEntryLevelColumns(Map<Column,String> map){
			if (map == null) return;
			for (Column c : Column.values()){
				if (!c.isQueryAndResultColumn()) map.remove(c);
			}
		}
		
		public static List<Column> headersFor(MetaMode metaMode){
			List<Column> list = new ArrayList<>();
			for (Column c : Column.values()){

				if (metaMode.isQueryStatsMode() && !c.isQueryAndResultColumn()){
					continue;
				} else if (!metaMode.isCleanTextMode() && c.equals(Column.clean_text)){
					continue;
				} else if (
						!metaMode.isQueryStatsMode() && 
						(c.equals(Column.compared_result_count) || c.equals(Column.query_distinct))
						){
					continue;
				} else list.add(c);
			}
			return list;
		}
	}
	
	/**
	 * Most useful for {@link AttributeSelectRule}
	 * Note: value_matching can pass either a Pattern or a String.
	 * @author mjohns
	 *
	 */
	public static enum AttrQueryType{
	key, key_starting, value, value_not, value_containing, value_ending, value_starting, value_matching;	
	}
	
	/**
	 * Most useful for {@link IOUtils#writeCsv(...)}
	 * @author mjohns
	 *
	 */
	public static enum CsvOptions{
		create_headers, create_no_headers, create_headers_data, create_no_headers_data, append_data;
	}
	
	/**
	 * For indicating String match rules
	 * @author mjohns
	 *
	 */
	public static enum StringMatch{
		starting_with, starting_without, ending_with, ending_without, containing, not_containing, regex, without_regex;  
	}
	
	public static enum FilePart{
		path, filename_full, filename_no_extension, content, extension;
	}
	
	public static final ParseStage firstStage = ParseStage.init.nextStage();
	public static final StringSample defaultStringSample = StringSample.begin_and_end;
	public static final int defaultPrintMax = 100;
	
	//NOTE: THESE ARE HARD-CODED INTO CRAWLER4J, EXPOSED FOR REFERENCE ONLY {{
	public static final String dbFolderName = "frontier";
	public static final String dbName = "DocIDs";
	// }}
	
	public static final int defaultNumCrawlers = 1;//set per run.
	public static final int defaultPolitenessDelay = 1000;//millies
	public static final int defaultMaxDepthOfCrawling = 0;//don't crawl beyond provided pages.
	public static final int defaultMaxPagesToFetch = -1;//-1 for no limit
	public static final boolean defaultResumableCrawling = false;//-1 for no limit
	
	public static final String outputFolderName = "output";
	public static final String urlFolderName = "url";
	public static final String textFolderName = "text";
	public static final String archiveFolderName = "archive";
	public static final String cleanFolderName = "clean";
	public static final String errorFolderName = "error";
	public static final String doc_idFolderName = "doc_id";
	public static final String metaFolderName = "meta";
	public static final String apiLiveFolderName = "api_live";
	public static final String apiEntryFolderName = "api_entry";
	public static final String abstractFolderName = "abstract";
		
	public static final String cleanFolderExt = ".txt";
	public static final String urlFolderExt = ".txt";
	public static final String docIdFolderExt = ".txt";
	public static final String metaFolderExt = ".csv";
	
	public static final String defaultHtmlExt = ".html";
	public static final String defaultJsonExt = ".json";
	public static final String defaultXmlExt = ".xml";
	
	public static final String csvDelim = ",";
	public static final int defaultValLimit = -1;
	public static final String truncatedToken = "[...]";
	
	public static final String httpRegex = "(http|https):\\/\\/([\\w\\-_]+(?:(?:\\.[\\w\\-_]+)+))([\\w\\-\\.,@?^=%&amp;:/~\\+#]*[\\w\\-\\@?^=%&amp;/~\\+#])?";	
	public static final Pattern httpPattern = Pattern.compile(httpRegex);
	public static final String pageToken = "%pageToken";
	public static final String queryToken = "%queryToken";
	public static final String offsetToken = "%offsetToken";
	public static final int defaultTimeout = 120000;
	public static final String defaultUserAgent = "Mozilla/17.0";
	
	public static final SimpleDateFormat dateFilenameFormat = new SimpleDateFormat("yyyy-MM-dd hh.mm.ss");
	public static final SimpleDateFormat dateQueryFormat = new SimpleDateFormat("yyyy-MM-dd");
	public static final Whitelist defaultWhitelist = Whitelist.none();//Whitelist.simpleText();
	public static final Cleaner defaultCleaner = new Cleaner(defaultWhitelist);
	public static final EscapeMode defaultEscapeMode = EscapeMode.xhtml;
	
	public static final String defaultSpaceNormalizerRegex = " {2,}";//
	public static final String defaultAnyWhitespaceRegex = "[\\s]+";
	public static final long millisInDays = 1000 * 60 * 60 * 24;
	public static final String defaultBaselineQueryVal = "news OR article OR coverage";
	public static final String defaultXmlHeader = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
}
