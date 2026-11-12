#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5cfd904a2a3ba11158e06acdedfae0d134b6faf47248ba02b81d6feb9586fbab/contract';
import endContract from '../../snapshots/5cfd904a2a3ba11158e06acdedfae0d134b6faf47248ba02b81d6feb9586fbab/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'agent',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('enabled', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lastRun', 'text', {
            notNull: true,
            default: lit('Never run'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('schedule', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('selector', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tools', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('url', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'agent_tools_elem_not_null_89bdc909',
            'array_position("tools", NULL) IS NULL',
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'run',
        columns: [
          col('agentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('duration', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('input', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('logs', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('output', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('parentRunId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('started', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('trigger', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'run_logs_elem_not_null_623afdd1',
            'array_position("logs", NULL) IS NULL',
          ),
          checkExpression(
            'run_status_check_74f184cc',
            "\"status\" IN ('Running', 'Success', 'Fialed', 'NeedsInput')",
          ),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'run',
        constraint: 'run_parentRunId_key',
        columns: ['parentRunId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'agent',
        index: 'agent_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'run',
        index: 'run_agentId_idx_8d0ba4f0',
        columns: ['agentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'run',
        index: 'run_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'run',
        foreignKey: {
          name: 'run_agentId_fkey',
          columns: ['agentId'],
          references: { schema: 'public', table: 'agent', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
