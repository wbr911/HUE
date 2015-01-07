package com.worksap.bootcamp.hue.elasticsearch.util;

import java.util.Map.Entry;
import java.util.Properties;

import org.elasticsearch.action.index.IndexRequestBuilder;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.ImmutableSettings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.worksap.bootcamp.hue.elasticsearch.exam.Restaurant;

public final class ElasticsearchClientGetter implements AutoCloseable {
    private final Logger logger = LoggerFactory.getLogger(ElasticsearchClientGetter.class);

    private volatile TransportClient client;
    private final String DEFAULT_SERVERS = "localhost:9300";
    private final String DEFAULT_CLUSTER_NAME = "company-forum";

    public ElasticsearchClientGetter() {
    }

    public synchronized Client getClient() {
        if (client == null) {
            ElasticSearchConfigOfMock config;
            Properties prop = createProps();
            config = new ElasticSearchConfigOfMock(prop);
            client = new TransportClient(ImmutableSettings.builder()
                    .put("cluster.name", config.getClusterName()));
            for (Entry<String, Integer> node : config.getClustersHostPort().entrySet()) {
                client.addTransportAddress(new InetSocketTransportAddress(node.getKey(), node.getValue()));
            }
        }
        return client;
    }

    private Properties createProps() {
        Properties prop = new Properties();
        String clusterName = System.getProperty(ElasticSearchConfigOfMock.ELASTICSEARCH_CLUSTER_NAME,
                DEFAULT_CLUSTER_NAME);
        String clusterServers = System.getProperty(ElasticSearchConfigOfMock.ELASTICSEARCH_CLUSTER_SERVERS,
                DEFAULT_SERVERS);
        prop.put(ElasticSearchConfigOfMock.ELASTICSEARCH_CLUSTER_NAME, clusterName);
        prop.put(ElasticSearchConfigOfMock.ELASTICSEARCH_CLUSTER_SERVERS, clusterServers);
        return prop;
    }

    @Override
    public synchronized void close() throws Exception {
        if (client != null) {
            client.close();
        }
    }
    public static void main(String args[]){
    	Client client =new ElasticsearchClientGetter().getClient();
    	 QueryBuilder query = QueryBuilders.matchAllQuery();
         SearchRequestBuilder request = client.prepareSearch(Restaurant.INDEX)
                 .setTypes(Restaurant.TYPE)
                 .setQuery(query);
         System.out.println(query);
         SearchResponse response = request.get();
         System.out.println(response);
         
    	
    }
}
