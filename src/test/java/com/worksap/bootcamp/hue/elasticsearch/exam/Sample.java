package com.worksap.bootcamp.hue.elasticsearch.exam;

import java.util.Collection;
import java.util.stream.StreamSupport;

import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.FilterBuilders;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Bucket;
import org.elasticsearch.search.aggregations.bucket.terms.Terms.Order;
import org.elasticsearch.search.aggregations.bucket.terms.TermsBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.junit.ClassRule;
import org.junit.Test;

/**
 * If not work, please take a look at README.md#Trouble Shooting
 *
 * @author Tomoki Odaka <odaka_to@worksap.co.jp>
 *
 */
public class Sample {
    @ClassRule
    public static ElasticsearchClientResource esClientResourse = new ElasticsearchClientResource();
    private final Client client = esClientResourse.getClient();

    @Test
    public void sampleMatchAllQuery() {
        QueryBuilder query = QueryBuilders.matchAllQuery();
        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                .setTypes(Restaurant.TYPE)
                .setQuery(query);
        System.out.println("-----------------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
    }

    @Test
    public void sampleFilterdQuery() {
        QueryBuilder query = QueryBuilders.filteredQuery(QueryBuilders.matchAllQuery(),
                FilterBuilders.termFilter(Restaurant.CLOSED, true));
        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                .setTypes(Restaurant.TYPE)
                .setQuery(query);
        System.out.println("-----------------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
    }

    @Test
    public void sampleSort() {
        QueryBuilder query = QueryBuilders.matchAllQuery();
        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                .setTypes(Restaurant.TYPE)
                .setQuery(query)
                .addSort(SortBuilders
                        .fieldSort(Restaurant.ID)
                        .order(SortOrder.ASC)
                        .missing("_last"));
        System.out.println("-----------------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
    }

    @Test
    public void sampleDisMaxQuery() {
        QueryBuilder query = QueryBuilders.disMaxQuery()
                .add(QueryBuilders.matchQuery(Restaurant.NAME, "東京"))
                .add(QueryBuilders.matchQuery(Restaurant.ADDRESS, "東京"));
        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                .setTypes(Restaurant.TYPE)
                .setQuery(query);
        System.out.println("-----------------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
        System.out.println("-----------------");
        StreamSupport.stream(response.getHits().spliterator(), false)
                .forEach(x -> System.out.println(x.sourceAsMap().get(Restaurant.NAME) + ":" + x.score()));
    }

    @Test
    public void sampleBoolQuery() {
        QueryBuilder query = QueryBuilders.boolQuery()
                .should(QueryBuilders.matchQuery(Restaurant.NAME, "東京"))
                .should(QueryBuilders.matchQuery(Restaurant.ADDRESS, "東京"));
        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                .setTypes(Restaurant.TYPE)
                .setQuery(query);
        System.out.println("-----------------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
        StreamSupport.stream(response.getHits().spliterator(), false)
                .forEach(x -> System.out.println(x.sourceAsMap().get(Restaurant.NAME) + ":" + x.score()));
    }

    @Test
    public void sampleAggregation() {
        QueryBuilder query = QueryBuilders.matchAllQuery();
        TermsBuilder aggregation = AggregationBuilders
                .terms("Category")
                .field(Restaurant.CATEGORY_ID1)
                .order(Order.count(false))
                .size(0);
        SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                .setTypes(Restaurant.TYPE)
                .addAggregation(aggregation)
                .setSize(0);
        System.out.println("-------aggregation----------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
        Collection<Bucket> buckets = response.getAggregations().<Terms> get("Category").getBuckets();
        buckets.stream().forEach(x -> System.out.println(x.getKey() + ":" + x.getDocCount()));
    }

    @Test
    public void sampleHighlight() {
    	
        QueryBuilder query = QueryBuilders.disMaxQuery()
                .add(QueryBuilders.prefixQuery(Station.NAME, "東").boost(2f))
                .add(QueryBuilders.prefixQuery(Station.PROPERTY, "東"));
        SearchRequestBuilder request = client.prepareSearch(Station.INDEX)
                .setTypes(Station.TYPE)
                .setQuery(query)
                .addHighlightedField(Station.NAME)
                .addHighlightedField(Station.PROPERTY)
                ;
        System.out.println("--------highlight---------");
        System.out.println(request);
        System.out.println("-----------------");
        SearchResponse response = request.get();
        System.out.println(response);
    }
}
