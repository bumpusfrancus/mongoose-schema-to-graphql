import mongoose from 'mongoose';
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} from 'graphql';

import mongooseSchemaToGraphQL, {
  generateNameForSubField,
  generateDescriptionForSubField,
} from '..';

import {
  getRidOfThunks,
} from './util';

test('generates schemas cyclicly defined population correctly', () => {
  const NAME = 'Whatever';
  const DESCRIPTION = 'Testing';

  const NothingSchema = new mongoose.Schema({
    something: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Whatever',
    }],
  });

  const NothingType = mongooseSchemaToGraphQL({
    name: 'Nothing',
    description: 'just just',
    schema: NothingSchema,
    class: 'GraphQLObjectType',
  });

  const Schema = new mongoose.Schema({
    whatever: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nothing',
    }],
  });

  const ExpectedType = getRidOfThunks(new GraphQLObjectType({
    name: NAME,
    description: DESCRIPTION,
    fields: () => ({
      whatever: {type: NothingType},
    }),
  }));

  const ReceivedType = getRidOfThunks(mongooseSchemaToGraphQL({
    name: NAME,
    class: 'GraphQLObjectType',
    description: DESCRIPTION,
    schema: Schema,
    exclude: ['_id'],
  }));

  expect(ReceivedType).toEqual(ExpectedType);
});
