package com.worksap.bootcamp.hue.elasticsearch.exam;

import static org.junit.Assert.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.junit.ClassRule;
import org.junit.Test;

import com.worksap.bootcamp.hue.elasticsearch.util.Pair;

public class SearchServiceTest {
	@ClassRule
	public static ElasticsearchClientResource esClientResourse = new ElasticsearchClientResource();
	private final SearchServiceImpl searchService = new SearchServiceImpl(esClientResourse.getClient());
	
	@Test
	public void testSearchRestaurant() {
		searchService.searchRestaurant("らぁーめんしょう", 20, 0);
	}
	
	@Test
	public void testAllRestaurantsSortedByAccessCount(){
		int count = 0;
		Pair<List<Map<String, Object>>, String> pair = searchService.allRestaurantsSortedByAccessCount(1000);
//		while(pair.second !=null){
//			count += pair.first.size();
//			pair.first.stream().forEach(x -> {
//				System.out.println(x.get("name"));
//			});
//			pair = searchService.scroll(pair.second);
//		}
//		System.out.println(count);
		
	}
	
	@Test
	public void testScroll(){
		Pair<List<Map<String, Object>>, String> pair = searchService.allRestaurantsSortedByAccessCount(10);
		Pair<List<Map<String, Object>>, String> pair2 = searchService.scroll(pair.second);
	}
	
	@Test 
	public void testautoComplete(){
//		Client client = esClientResourse.getClient();
//		 QueryBuilder query = QueryBuilders.matchAllQuery();
//	        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
//	                .setTypes(Restaurant.TYPE)
//	                .setQuery(query)
//	                .setSize(30);
//	        System.out.println("-----------------");
//	        System.out.println(request);
//	        System.out.println("-----------------");
//	        SearchHits response = request.get().getHits();
//	        System.out.println("size :"+ response.getHits().length);
//	        for(SearchHit hit : response){
//	        	System.out.println(hit.getSource());
//	        }
		List<Map<String,Object>> docs = searchService.autoComplete("東京", 1000);
		docs.stream().forEach(x -> {
			//System.out.println(x.get("name"));
			if(Objects.equals(x.get("name"),"浜松町東京會舘")){
				fail();
			}
		});;
		System.out.println(docs.size());
		
	}
	@Test
	public void testPartialMatch(){
		searchService.partialMatch("東");
	}
	
	@Test
	public void testStationCountParLine(){
		searchService.stationCountParLine();
	}
	
	@Test
	public void testSearchRestaurantUnderFilteredByCategoryId1(){
		searchService.searchRestaurantUnderFilteredByCategoryId1("らぁ～めん笑", 20, 0, 317);
	}
	
	@Test 
	public void testAutoCompleteWithHighlight(){
		searchService.autoCompleteWithHighlight("焼肉", 10);
	}
	
	@Test
	public void testAutoCompleteWithAlfabet(){
		searchService.autoCompleteWithAlfabet("udon", 100);
	}
	
	@Test
	public void testAllRestaurantsSortedByName(){
		int count = 0;
		int index = 0;
		Pair<List<Map<String, Object>>, String> pair = searchService.allRestaurantsSortedByName(10);
		pair.first.stream().forEach(System.out::println);
//		while(pair.first.size() !=0){
//			count += pair.first.size();
////			pair.first.stream().forEach(x -> {
////				//System.out.println(x.get("name"));
////			});
//			pair = searchService.scroll(pair.second);
//			System.out.println("count is :"+count + "  time is " + index++ + "scroll id" + pair.second);	
//		}
		
	}
	
	@Test
	public void testSearchDescription(){
		searchService.searchDescription("出口");
	}

}
