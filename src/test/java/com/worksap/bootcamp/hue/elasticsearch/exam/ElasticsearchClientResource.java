package com.worksap.bootcamp.hue.elasticsearch.exam;

import org.elasticsearch.client.Client;
import org.junit.rules.ExternalResource;

import com.worksap.bootcamp.hue.elasticsearch.util.ElasticsearchClientGetter;

public class ElasticsearchClientResource extends ExternalResource {
    ElasticsearchClientGetter elasticsearchClientGetter;

    public Client getClient() {
        return elasticsearchClientGetter.getClient();
    }

    @Override
    protected void before() throws Throwable {
        super.before();
        elasticsearchClientGetter = new ElasticsearchClientGetter();
    }

    @Override
    protected void after() {
        super.after();
        try {
            elasticsearchClientGetter.close();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
