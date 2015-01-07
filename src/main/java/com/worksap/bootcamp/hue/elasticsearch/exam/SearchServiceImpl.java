package com.worksap.bootcamp.hue.elasticsearch.exam;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import org.apache.lucene.search.TermQuery;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.FilterBuilder;
import org.elasticsearch.index.query.FilterBuilders;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.aggregations.AggregationBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.elasticsearch.search.highlight.HighlightField;
import org.elasticsearch.search.sort.SortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;

import com.worksap.bootcamp.hue.elasticsearch.util.ElasticsearchClientGetter;
import com.worksap.bootcamp.hue.elasticsearch.util.Pair;

/**
 * @author works
 *
 */
public class SearchServiceImpl {
	private final Client client;

	public SearchServiceImpl(Client client) {
		this.client = client;
	}

	/**
	 * free word search at {@link Restaurant#NAME}, {@link Restaurant#NAME_KANA}
	 * , {@link Restaurant#ADDRESS}.</br>
	 *
	 * {@link Restaurant#NAME}, {@link Restaurant#NAME_KANA} are scored by the
	 * boost of 2.0.</br>
	 *
	 * word should be analyzed by default analyzer.</br>
	 *
	 * @param keyword
	 * @param size
	 * @param from
	 * @return
	 */

	public List<Map<String, Object>> searchRestaurant(String keyword, int size,
			int from) {
		QueryBuilder query = QueryBuilders
				.disMaxQuery()
				.add(QueryBuilders.matchQuery(Restaurant.NAME, keyword).boost(
						2f))
				.add(QueryBuilders.matchQuery(Restaurant.NAME_KANA, keyword)
						.boost(2f))
				.add(QueryBuilders.matchQuery(Restaurant.ADDRESS, keyword));
		SearchResponse response = client.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE).setQuery(query).setFrom(from)
				.setSize(size).get();
		List<Map<String, Object>> resList = sourceOf(response);
		log2console(query, response, "searchRestaurant by keyword: " + keyword);
		return resList;
	}

	/**
	 * get all restaurants with scroll API with 1 min timeout.</br>
	 *
	 * the returned restaurants is sorted by access count field (DESC).</br>
	 *
	 * this method returns the documents of the first scroll,</br>
	 *
	 * and the followed docments will return by scroll method.</br>
	 *
	 * @param size
	 * @return pair of elasticsearch search result(source field) and scroll id
	 */
	public Pair<List<Map<String, Object>>, String> allRestaurantsSortedByAccessCount(
			int size) {
		QueryBuilder query = QueryBuilders.matchAllQuery();
		SearchResponse scrollResp = client
				.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE)
				.setQuery(query)
				.addSort(
						SortBuilders.fieldSort(Restaurant.ACCESS_COUNT)
								.order(SortOrder.DESC).missing("_last"))
				.setSize(size).setScroll(new TimeValue(60000)).execute()
				.actionGet();
		List<Map<String, Object>> resList = sourceOf(scrollResp);
		//log2console(query, scrollResp, "allRestaurantsSortedByAccessCount");
		// SearchResponse scrollResp2
		// =client.prepareSearchScroll(scrollResp.getScrollId()).setScroll(new
		// TimeValue(10000)).execute().actionGet();
		// log2console(query, scrollResp2,"allRestaurantsSortedByAccessCount");
		return Pair.create(resList, scrollResp.getScrollId());
	}

	/**
	 * get all restaurants with scroll API with 1 min timeout.</br>
	 *
	 * @param scrollId
	 * @return pair of elasticsearch search result(source field) and scroll id
	 */
	public Pair<List<Map<String, Object>>, String> scroll(String scrollId) {
		SearchResponse scrollResp = client.prepareSearchScroll(scrollId)
				.setScroll(new TimeValue(60000)).execute().actionGet();
		List<Map<String, Object>> resList = sourceOf(scrollResp);
		//log2console(null, scrollResp, "scroll");
		return Pair.create(resList, scrollId);
	}

	/**
	 * forward match search at {@link Restaurant#NAME}, and
	 * {@link Restaurant#NAME_KANA}</br>
	 *
	 * @param prefix
	 * @param size
	 * @return search result(source field)
	 */
	public List<Map<String, Object>> autoComplete(String prefix, int size) {
		QueryBuilder query = QueryBuilders
				.boolQuery()
				.should(QueryBuilders.prefixQuery(Restaurant.NAME+Restaurant._RAW, prefix))
				.should(QueryBuilders.prefixQuery(Restaurant.NAME_KANA+Restaurant._RAW, prefix));
		SearchRequestBuilder req = client.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE).setQuery(query).setSize(size);
		SearchResponse resp = req.get();
		List<Map<String, Object>> resList = sourceOf(resp);
		System.out.println(req);
		return resList;
	}

	/**
	 * partial match search against {@link Restaurant#NAME}, and
	 * {@link Restaurant#NAME_KANA}</br>
	 *
	 * sorted by name_kana field.</br>
	 *
	 * for example (not real result)
	 *
	 * search with "ホルモン" return
	 *
	 * "ホルモン屋", "東京ホルモン", "焼肉 ホルモン 大関"
	 *
	 * @see <a
	 *      href="https://hue.workslan/bt/sphinx/fullTextSearch/index.html#edge-n-gram">
	 *      Back Edge N-Gram</a>
	 *
	 * @see <a href="http://localhost:9200/_plugin/inquisitor/#/analyzers">
	 *      search proper analyzer in inquisitor plugin</a>
	 *
	 * @param keyword
	 * @return search result(source field)
	 */
	public List<Map<String, Object>> partialMatch(String keyword) {
		QueryBuilder query = QueryBuilders.boolQuery().should(
				QueryBuilders.prefixQuery(Restaurant.NAME
						+ Restaurant._BACKED_EDGE_NGRAM, keyword));
		SearchResponse reponse = client
				.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE)
				.setQuery(query)
				.addSort(
						SortBuilders.fieldSort(Restaurant.NAME_KANA).missing(
								"_last")).execute().actionGet();
		List<Map<String, Object>> resList = sourceOf(reponse);

		return resList;
	}

	/**
	 * count stations grouped by property field(line name)</br>
	 *
	 * ex.)</br>
	 *
	 * 東海道新幹線:15</br>
	 *
	 * 東京メトロ銀座線:20</br>
	 *
	 * @return map (key:property field, value:number of station)
	 */
	public Map<String, Long> stationCountParLine() {
		SearchResponse resp = client
				.prepareSearch(Station.INDEX)
				.setTypes(Station.TYPE)
				.addAggregation(
						AggregationBuilders.terms("property")
								.field(Station.PROPERTY).size(0))
				.execute()
				.actionGet();
		Collection<Bucket> buckets = resp.getAggregations()
				.<Terms> get("property").getBuckets();
		Map<String, Long> res = new HashMap<String, Long>();
		buckets.stream().forEach(x -> res.put(x.getKey(), x.getDocCount()));
		res.keySet()
				.stream()
				.forEach(
						x -> System.out.println("[ " + x + " : " + res.get(x)
								+ " ]"));
		return res;
	}

	/**
	 * extend searchRestaurant method to enable filter by category_id1.</br>
	 *
	 * elasticsearch have 2 ways of filter, post filter and filtered query.</br>
	 *
	 * understand the difference, and understand the reason why filtered query
	 * is better in this case.</br>
	 *
	 * @see <a
	 *      href="http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-post-filter.html#search-request-post-filter">
	 *      post filter</a>
	 *
	 * @see <a
	 *      href="http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-filtered-query.html">
	 *      filtered query</a>
	 *
	 * @param keyword
	 * @param size
	 * @param from
	 * @param category_id1
	 * @return search result(source field)
	 */
	public List<Map<String, Object>> searchRestaurantUnderFilteredByCategoryId1(
			String keyword, int size, int from, int category_id1) {
		QueryBuilder query = QueryBuilders
				.disMaxQuery()
				.add(QueryBuilders.matchQuery(Restaurant.NAME, keyword).boost(
						2f))
				.add(QueryBuilders.matchQuery(Restaurant.NAME_KANA, keyword)
						.boost(2f))
				.add(QueryBuilders.matchQuery(Restaurant.ADDRESS, keyword));

		QueryBuilder filteredQuery = QueryBuilders.filteredQuery(query,
				FilterBuilders
						.termFilter(Restaurant.CATEGORY_ID1, category_id1));
		SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE).setQuery(filteredQuery)
				.setFrom(from).setSize(size);
		System.out.print(request);
		List<Map<String, Object>> res = sourceOf(request.get());
		return res;
	}

	/**
	 * extend autoComplete method to enable highlight</br>
	 *
	 * we use our own highlighter in HUE,</br>
	 *
	 * but now, we use Elasticsearch standerd highlighter</br>
	 *
	 * @see <a
	 *      href="http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/search-request-highlighting.html">
	 *      highlighting</a>
	 *
	 * @param prefix
	 * @return pair of sourse field and highlight field
	 */
	public List<Pair<Map<String, Object>, Map<String, HighlightField>>> autoCompleteWithHighlight(
			String prefix, int size) {
		QueryBuilder query = QueryBuilders
				.boolQuery()
				.should(QueryBuilders.prefixQuery(Restaurant.NAME, prefix))
				.should(QueryBuilders.prefixQuery(Restaurant.NAME_KANA, prefix));
		SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE).setQuery(query).setSize(size)
				.addHighlightedField(Restaurant.NAME)
				.addHighlightedField(Restaurant.NAME_KANA)
				.setHighlighterRequireFieldMatch(true);

		return highlightOf(request.get());
	}

	/**
	 * extend autoComplete method to enable search with alfabet.</br>
	 *
	 * for example (not real result)
	 *
	 * search with "udon" return
	 *
	 * "うどん屋 ほげほげ"
	 *
	 * @param prefix
	 * @return sourse field
	 */
	public List<Map<String, Object>> autoCompleteWithAlfabet(String prefix,
			int size) {
		QueryBuilder query = QueryBuilders.prefixQuery(Restaurant.NAME_KANA
				+ Restaurant._ROMANIZE, prefix);
		// query = QueryBuilders.filteredQuery(query,
		// FilterBuilders.termFilter(Restaurant.NAME+Restaurant._RAW,
		// "うどん屋 ほげほげ"));
		SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE).setQuery(query).setSize(size);
		return sourceOf(request.get());
	}

	/**
	 * change allRestaurantsSortedByAccessCount to return restaurants sorted by
	 * name field</br>
	 *
	 * be careful when sort by analyzed field, document is sort by token, not
	 * field.</br>
	 *
	 * so, you should use not-analyzed field.</br>
	 *
	 * @param size
	 * @return pair of elasticsearch search result(source field) and scroll id
	 */
	public Pair<List<Map<String, Object>>, String> allRestaurantsSortedByName(
			int size) {
		SearchResponse resp = client
				.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE)
				.setSize(size)
				.addSort(
						SortBuilders
								.fieldSort(Restaurant.NAME + Restaurant._RAW)
								.order(SortOrder.ASC).missing("_last"))
				.setScroll(new TimeValue(60000)).execute().actionGet();
		return Pair.create(sourceOf(resp), resp.getScrollId());
	}

	/**
	 * search description field (match query), which is analyzed by kuromoji (a
	 * morphological analyzer)</br>
	 *
	 * @param keyword
	 * @return search result(source field)
	 */
	public List<Map<String, Object>> searchDescription(String keyword) {
		QueryBuilder query = QueryBuilders.matchQuery(Restaurant.DESCRIPTION,
				keyword);
		SearchResponse reps = client.prepareSearch(Restaurant.INDEX)
				.setTypes(Restaurant.TYPE).setQuery(query).execute()
				.actionGet();

		return sourceOf(reps);
	}

	/**
	 * print out the query and response for test
	 * 
	 * @param query
	 * @param response
	 */
	private void log2console(QueryBuilder query, SearchResponse response,
			String msg) {
		System.out.println("--------" + msg + "--query-----------");
		System.out.println(query);
		System.out.println("----------reponse-----------");
		System.out.println(response);
	}

	private List<Pair<Map<String, Object>, Map<String, HighlightField>>> highlightOf(
			SearchResponse response) {
		System.out.println(response);
		return searchHitsOf.apply(response)
				.map(s -> Pair.create(s.sourceAsMap(), s.getHighlightFields()))
				.collect(Collectors.toList());
	}

	private SearchRequestBuilder searchFor(String type) {
		return client.prepareSearch(Restaurant.INDEX).setTypes(type);
	}

	private List<Map<String, Object>> sourceOf(SearchResponse response) {
		System.out.println(response);
		//System.out.println(response.getHits().getTotalHits());
		return sourceOf.apply(response).collect(Collectors.toList());
	}

	private final Function<? super SearchResponse, ? extends Stream<? extends SearchHit>> searchHitsOf = response -> StreamSupport
			.stream(response.getHits().spliterator(), false);

	private final Function<? super SearchResponse, ? extends Stream<Map<String, Object>>> sourceOf = searchHitsOf
			.andThen(searchHits -> searchHits.map(SearchHit::sourceAsMap));

}
