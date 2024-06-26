import { InputTypeComposer } from 'graphql-compose';
import { getMatchAllITC } from './MatchAll';

import { getBoolITC, prepareBoolInResolve } from './Compound/Bool';
import { getConstantScoreITC, prepareConstantScoreInResolve } from './Compound/ConstantScore';
import { getDisMaxITC, prepareDisMaxResolve } from './Compound/DisMax';
import { getBoostingITC, prepareBoostingInResolve } from './Compound/Boosting';
import { getFunctionScoreITC, prepareFunctionScoreInResolve } from './Compound/FunctionScore';

import { getExistsITC } from './TermLevel/Exists';
import { getFuzzyITC } from './TermLevel/Fuzzy';
import { getIdsITC } from './TermLevel/Ids';
import { getPrefixITC } from './TermLevel/Prefix';
import { getRangeITC } from './TermLevel/Range';
import { getRegexpITC } from './TermLevel/Regexp';
import { getTypeITC } from './TermLevel/Type';
import { getTermITC } from './TermLevel/Term';
import { getTermsITC } from './TermLevel/Terms';
import { getWildcardITC } from './TermLevel/Wildcard';

import { getMatchITC } from './FullText/Match';
import { getMatchPhraseITC } from './FullText/MatchPhrase';
import { getMatchPhrasePrefixITC } from './FullText/MatchPhrasePrefix';
import { getMultiMatchITC } from './FullText/MultiMatch';
import { getCommonITC } from './FullText/Common';
import { getQueryStringITC } from './FullText/QueryString';
import { getSimpleQueryStringITC } from './FullText/SimpleQueryString';

import { getGeoBoundingBoxITC } from './Geo/GeoBoundingBox';
import { getGeoDistanceITC } from './Geo/GeoDistance';
import { getGeoPolygonITC } from './Geo/GeoPolygon';
import { getGeoShapeITC } from './Geo/GeoShape';

import { getMoreLikeThisITC } from './Specialized/MoreLikeThis';
import { getPercolateITC } from './Specialized/Percolate';
import { getScriptITC } from './Specialized/Script';

import { getHasChildITC } from './Joining/HasChild';
import { getHasParentITC } from './Joining/HasParent';
import { getNestedITC } from './Joining/Nested';
import { getParentIdITC } from './Joining/ParentId';

import { getTypeName, CommonOpts, desc } from '../../utils';

export function getQueryITC<TContext>(opts: CommonOpts<TContext>): InputTypeComposer<TContext> {
  const name = getTypeName('Query', opts);
  const description = desc(
    `
    Elasticsearch provides a full Query DSL based on JSON to define queries.
    [Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
  `
  );

  return opts.getOrCreateITC(name, () => ({
    name,
    description,
    fields: {
      match_all: getMatchAllITC(opts),

      // Compound queries
      bool: getBoolITC(opts),
      constant_score: getConstantScoreITC(opts),
      dis_max: getDisMaxITC(opts),
      boosting: getBoostingITC(opts),
      function_score: getFunctionScoreITC(opts),

      // FullText queries
      match: getMatchITC(opts),
      match_phrase: getMatchPhraseITC(opts),
      match_phrase_prefix: getMatchPhrasePrefixITC(opts),
      multi_match: getMultiMatchITC(opts),
      common: getCommonITC(opts),
      query_string: getQueryStringITC(opts),
      simple_query_string: getSimpleQueryStringITC(opts),

      // Term queries
      exists: getExistsITC(opts),
      fuzzy: getFuzzyITC(opts),
      ids: getIdsITC(opts),
      prefix: getPrefixITC(opts),
      range: getRangeITC(opts),
      regexp: getRegexpITC(opts),
      type: getTypeITC(opts),
      term: getTermITC(opts),
      terms: getTermsITC(opts),
      wildcard: getWildcardITC(opts),

      // Geo queries
      geo_bounding_box: getGeoBoundingBoxITC(opts),
      geo_distance: getGeoDistanceITC(opts),
      geo_polygon: getGeoPolygonITC(opts),
      geo_shape: getGeoShapeITC(opts),

      // Specialized queries
      more_like_this: getMoreLikeThisITC(opts),
      percolate: getPercolateITC(opts),
      script: getScriptITC(opts),

      // Joining queries
      has_child: getHasChildITC(opts),
      has_parent: getHasParentITC(opts),
      nested: getNestedITC(opts),
      parent_id: getParentIdITC(opts),
    },
  }));
}

/* eslint-disable no-param-reassign */
export function prepareQueryInResolve(
  query: { [argName: string]: any },
  fieldMap: any
): { [argName: string]: any } {
  //
  // Compound queries
  //
  if (query.bool) {
    query.bool = prepareBoolInResolve(query.bool, fieldMap);
  }
  if (query.post_filter) {
    query.post_filter = prepareQueryInResolve(query.post_filter, fieldMap);
  }
  if (query.nested && query.nested.query && query.nested.path) {
    query.nested.path = query.nested.path.replace(/__/g, '.');
    query.nested.query = prepareQueryInResolve(query.nested.query, fieldMap);
  }
  if (query.constant_score) {
    query.constant_score = prepareConstantScoreInResolve(query.constant_score, fieldMap);
  }
  if (query.dis_max) {
    query.dis_max = prepareDisMaxResolve(query.dis_max, fieldMap);
  }
  if (query.boosting) {
    query.boosting = prepareBoostingInResolve(query.boosting, fieldMap);
  }
  if (query.function_score) {
    query.function_score = prepareFunctionScoreInResolve(query.function_score, fieldMap);
  }

  //
  // FullText queries
  //
  if (query.match) {
    query.match = renameUnderscoredToDots(query.match, fieldMap);
  }
  if (query.match_phrase) {
    query.match_phrase = renameUnderscoredToDots(query.match_phrase, fieldMap);
  }
  if (query.match_phrase_prefix) {
    query.match_phrase_prefix = renameUnderscoredToDots(query.match_phrase_prefix, fieldMap);
  }
  if (query.common) {
    query.common = renameUnderscoredToDots(query.common, fieldMap);
  }

  //
  // Geo queries
  //
  if (query.geo_bounding_box) {
    query.geo_bounding_box = renameUnderscoredToDots(query.geo_bounding_box, fieldMap);
  }
  if (query.geo_distance) {
    query.geo_distance = renameUnderscoredToDots(query.geo_distance, fieldMap);
  }
  if (query.geo_polygon) {
    query.geo_polygon = renameUnderscoredToDots(query.geo_polygon, fieldMap);
  }
  if (query.geo_shape) {
    query.geo_shape = renameUnderscoredToDots(query.geo_shape, fieldMap);
  }

  //
  // TermLevel queries
  //
  if (query.fuzzy) {
    query.fuzzy = renameUnderscoredToDots(query.fuzzy, fieldMap);
  }
  if (query.prefix) {
    query.prefix = renameUnderscoredToDots(query.prefix, fieldMap);
  }
  if (query.range) {
    query.range = renameUnderscoredToDots(query.range, fieldMap);
  }
  if (query.regexp) {
    query.regexp = renameUnderscoredToDots(query.regexp, fieldMap);
  }
  if (query.term) {
    query.term = renameUnderscoredToDots(query.term, fieldMap);
  }
  if (query.terms) {
    query.terms = renameUnderscoredToDots(query.terms, fieldMap);
  }
  if (query.wildcard) {
    query.wildcard = renameUnderscoredToDots(query.wildcard, fieldMap);
  }

  return query;
}

export function renameUnderscoredToDots(obj: any, _fieldMap: any) {
  const result = {} as Record<string, any>;
  Object.keys(obj).forEach((o) => {
    result[o.replace(/__/g, '.')] = obj[o];
  });
  return result;
}
