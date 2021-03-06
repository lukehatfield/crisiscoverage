package info.crisiscoverage.crawler.configs.google;

import org.jsoup.nodes.Element;

import com.google.common.base.Strings;

public class MultiSiteMetaMapper extends GoogleApiMetaMapper {
	
	@Override
	protected String queryStringFromQueryElement(Element queryElement){
		if (queryElement == null) return "";
		String q = queryElement.attr("cse:sitesearch");
		if (!Strings.isNullOrEmpty(q)){
			String dr = queryElement.attr("cse:daterestrict");
			if (!Strings.isNullOrEmpty(dr)) q +=("-"+dr);
			return q;
		} else if (q != null){
			q = queryElement.attr("cse:daterestrict");
			return q;
		}
		return "";
	}

}