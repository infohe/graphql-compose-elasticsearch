/* eslint-disable no-param-reassign */

import {
  upperFirst,
  EnumTypeComposer,
  InputTypeComposerFieldConfigMapDefinition,
  ScalarTypeComposer,
} from 'graphql-compose';
import type { EnumTypeComposerValueConfigMapDefinition } from 'graphql-compose/lib/EnumTypeComposer';
import { getTypeName, CommonOpts, desc } from '../../utils';

export type ElasticDataType = string;

export function getStringFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['text', 'keyword', 'string'], 'String');
}

export function getStringAsFieldConfigMap(opts: CommonOpts<any>, fc: any) {
  return getFieldConfigMap(opts, ['text', 'keyword', 'string'], fc);
}

export function getAnalyzedFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['text', 'string'], 'String', true);
}

export function getAnalyzedAsFieldConfigMap(opts: CommonOpts<any>, fc: any) {
  return getFieldConfigMap(opts, ['text', 'string'], fc, true);
}

export function getKeywordAsFieldConfigMap(opts: CommonOpts<any>, fc: any) {
  return getFieldConfigMap(opts, ['keyword'], fc);
}

export function getNumericFields(opts: CommonOpts<any>) {
  return getFieldNamesType(
    opts,
    [
      'byte',
      'short',
      'integer',
      'long',
      'double',
      'float',
      'half_float',
      'scaled_float',
      'token_count',
    ],
    'Numeric'
  );
}

export function getDateFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['date'], 'Date');
}

export function getBooleanFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['boolean'], 'Boolean');
}

export function getGeoPointFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['geo_point'], 'GeoPoint');
}

export function getGeoPointAsFieldConfigMap(opts: CommonOpts<any>, fc: any) {
  return getFieldConfigMap(opts, ['geo_point'], fc);
}

export function getGeoShapeAsFieldConfigMap(opts: CommonOpts<any>, fc: any) {
  return getFieldConfigMap(opts, ['geo_shape'], fc);
}

export function getNestedFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['nested'], 'Nested');
}

export function getIpFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['ip'], 'Ip');
}

export function getPercolatorFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['percolator'], 'Percolator');
}

export function getTermFields(opts: CommonOpts<any>) {
  return getFieldNamesType(
    opts,
    [
      'keyword',
      'date',
      'boolean',
      'ip',
      'byte',
      'short',
      'integer',
      'long',
      'double',
      'float',
      'half_float',
      'scaled_float',
      'token_count',
    ],
    'Term'
  );
}

export function getAllFields(opts: CommonOpts<any>) {
  return getFieldNamesType(opts, ['_all'], 'All');
}

export function getAllAsFieldConfigMap(opts: CommonOpts<any>, fc: any) {
  return getFieldConfigMap(opts, ['_all'], fc);
}

export function getFieldNamesByElasticType(fieldMap: any, types: ElasticDataType[]): string[] {
  const fieldNames = [] as string[];
  types.forEach((type) => {
    if (typeof fieldMap[type] === 'object') {
      Object.keys(fieldMap[type]).forEach((fieldName) => {
        fieldNames.push(fieldName);
      });
    }
  });
  return fieldNames;
}

export function getFieldNamesType(
  opts: CommonOpts<any>,
  types: ElasticDataType[],
  typePrefix: string,
  addAll: boolean = false
): EnumTypeComposer<any> | ScalarTypeComposer | string {
  if (!opts || !opts.fieldMap) {
    return 'String';
  }

  if (!types) {
    types = ['_all'];
    typePrefix = 'All';
  }
  if (!typePrefix) {
    types.sort();
    typePrefix = types.map((t) => upperFirst(t)).join('');
  }
  const name = getTypeName(`${typePrefix}Fields`, opts);
  const description = desc(`Available fields from mapping.`);

  return opts.schemaComposer.getOrSet(name, () => {
    if (!opts || !opts.fieldMap) {
      return opts.schemaComposer.getSTC('String');
    }
    const values = getEnumValues(opts.fieldMap, types, addAll);

    if (Object.keys(values).length === 0) {
      return opts.schemaComposer.getSTC('String');
    }

    return opts.schemaComposer.createEnumTC({
      name,
      description,
      values,
    });
  }) as any;
}

function getEnumValues(
  fieldMap: any,
  types: ElasticDataType[],
  addAll: boolean = false
): EnumTypeComposerValueConfigMapDefinition {
  const values = {} as Record<string, any>;
  if (addAll) {
    values._all = {
      value: '_all',
    };
  }
  getFieldNamesByElasticType(fieldMap, types).forEach((fieldName) => {
    values[fieldName] = {
      value: fieldName.replace(/__/g, '.'),
    };
  });
  return values;
}

// FieldsMap generated by this function, contain underscored field names
// So you should manually reassemble args before sending query to ElasticSearch
// for renaming { "field__subField": 123 } to { "field.subField": 123 }
// Eg. see elasticDSL/Query/Query.js method prepareQueryInResolve()
export function getFieldConfigMap(
  opts: any,
  types: ElasticDataType[],
  fc: any,
  addAll: boolean = false
): InputTypeComposerFieldConfigMapDefinition | string {
  if (!fc) fc = 'JSON';
  if (!opts || !opts.fieldMap) {
    return 'JSON';
  }

  if (!types) {
    types = ['_all'];
  }

  const fcMap = {} as Record<string, any>;
  if (addAll) {
    fcMap._all = fc;
  }
  getFieldNamesByElasticType(opts.fieldMap, types).forEach((fieldName) => {
    fcMap[fieldName] = fc;
  });

  if (Object.keys(fcMap).length === 0) {
    return 'JSON';
  }

  return fcMap;
}