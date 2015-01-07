
How to Study
------------------------------------

- install middleware

	- Use hue-environment-manager(https://info.hue.workslan/doc/company-hue-release-doc/sphinx/environment/preparation.html#id1)

	- Or setup java-8, eclipse 4.4, elasticsearch 1.2.1, ruby 2.X manually.

- switch off elasticsearch discovery

```
cd  ${APP_DIR}/elasticsearch-${ES_VERSION}/config
sed -i 's/#\(discovery.zen.ping.multicast.enabled: false\)/\1/' elasticsearch.yml
```

- install the following plugins (if not installed)

	- https://github.com/mobz/elasticsearch-head
	- https://github.com/elasticsearch/elasticsearch-analysis-kuromoji
	- https://github.com/elasticsearch/elasticsearch-analysis-icu
	- https://github.com/polyfractal/elasticsearch-inquisitor

example

```
${APP_DIR}/elasticsearch-${ES_VERSION}/bin/plugin -install polyfractal/elasticsearch-inquisitor
```

- run elasticsearch

	- ${APP_DIR}/elasticsearch-${ES_VERSION}/bin/elasticsearch.bat

- exec elasticsearch-study/setup.sh, it does ...

	- download dataset
	- setup index
	- import data

```
sh elasticsearch-study/setup.sh
```

At first, some command fail, but no problem.

- execute the following command at current directory (this README.md exists) on Console2

```
mvn eclipse:eclipse
```

- implement SearchServiceImpl.java

I write some sample in Sample.java.
At first, please run Sample.java with junit to check the data.
There are some unused fields. So check Restaurant.java and Station.java, that have fields you use in this bootcamp.
Check elasticsearch-study/mapping.json. It writes the mappings of index you use.

You can check all analyzers you can use by using inquisitor plugin (http://localhost:9200/_plugin/inquisitor/)

How to submit your product
------------------------------------

- execute the following command at current directory (this README.md exists) on Console2

```
mvn clean package
```

submit target/bootcamp-elasticsearch-1.0-sources.jar by kenshu kanri system.

Trouble Shooting
------------------------------------

- check the version of elasticsearch-server and client

	When these versions is differ, fix the client version by rewrite pom.xml's elasticsearch.version property.

- check ElasticsearchClientGetter#DEFAULT_CLUSTER_NAME is same as the server value

server value
```
cd  ${APP_DIR}/elasticsearch-${ES_VERSION}/config
grep "cluster.name"  elasticsearch.yml
```

- switch off elasticsearch discovery

```
cd  ${APP_DIR}/elasticsearch-${ES_VERSION}/config
sed -i 's/#\(discovery.zen.ping.multicast.enabled: false\)/\1/' elasticsearch.yml
```
