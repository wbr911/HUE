#!/bin/bash

DATASET_DIR=datasets
ES_SERVER_NAME=localhost
ES_PORT=9200
ES_INDEX_NAME=ldgourmet
ES_DOCUMENT_NAMES='restaurant station'

SCRIPT_DIR=$(cd $(dirname $0) && pwd)
cd ${SCRIPT_DIR}

if [ ! -e "${DATASET_DIR}/ldgourmet.tar.gz" ] ; then
  mkdir -p ${DATASET_DIR}
  cd datasets
  curl -k -o ldgourmet.tar.gz -u hue:high-u5abi1ity 'https://hue.workslan/owncloud/index.php/apps/files/ajax/download.php?dir=%2F2.BT%2FHUEBootcamp%2Felasticsearch&files=ldgourmet.tar.gz'
  tar zxvf ldgourmet.tar.gz
  cd ..
fi
curl -XDELETE ${ES_SERVER_NAME}:${ES_PORT}/${ES_INDEX_NAME}
curl -XPOST ${ES_SERVER_NAME}:${ES_PORT}/${ES_INDEX_NAME} -d @mapping.json

for ES_DOCUMENT_NAME in ${ES_DOCUMENT_NAMES}; do
 script/bulk_load_data.rb\
   -s ${ES_SERVER_NAME}\
   -p ${ES_PORT}\
   -i ${ES_INDEX_NAME}\
   -t ${ES_DOCUMENT_NAME}\
   -f ${DATASET_DIR}/${ES_DOCUMENT_NAME}s.csv
done
