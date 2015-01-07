package com.worksap.bootcamp.hue.elasticsearch.util;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import org.elasticsearch.common.base.Splitter;
import org.elasticsearch.common.collect.Iterables;

/**
 * <pre>
 * elasticsearch.cluster.servers=192.168.1.1:9300,192.168.1.2:9300
 * elasticsearch.cluster.name=elasticsearch
 * </pre>
 */
public class ElasticSearchConfigOfMock {

    static final String ELASTICSEARCH_CLUSTER_SERVERS = "elasticsearch.cluster.servers";
    static final String ELASTICSEARCH_CLUSTER_NAME = "elasticsearch.cluster.name";

    public ElasticSearchConfigOfMock(Properties properties) {
        this.clusterName = (String)properties.get(ELASTICSEARCH_CLUSTER_NAME);
        this.clustersHostPort = getClustersHostPort(properties);
    }

    private final String clusterName;

    private final Map<String, Integer> clustersHostPort;

    public String getClusterName() {
        return clusterName;
    }

    public Map<String, Integer> getClustersHostPort() {
        return clustersHostPort;
    }

    private static Map<String, Integer> getClustersHostPort(Properties properties) {
        String value = properties.getProperty(ELASTICSEARCH_CLUSTER_SERVERS);
        Iterable<String> nodes = Splitter.on(",").split(value);
        Map<String, Integer> ret = new HashMap<>();
        for (String node : nodes) {
            Iterable<String> values = Splitter.on(":").split(node);
            String[] hostAndPort = Iterables.toArray(values, String.class);
            ret.put(hostAndPort[0], Integer.valueOf(hostAndPort[1]));
        }
        return ret;
    }
}
