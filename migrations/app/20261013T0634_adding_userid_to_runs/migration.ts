#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/8840302a12f56fa4fd3b00a3394f11321d3456280c841086162cf1030b6da2c1/contract';
import startContract from '../../snapshots/8840302a12f56fa4fd3b00a3394f11321d3456280c841086162cf1030b6da2c1/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/2dc20101651e4a8b6c7c48b53f4bde9d84511a94c1f9e0567a4cfad2ec3697c8/contract';
import endContract from '../../snapshots/2dc20101651e4a8b6c7c48b53f4bde9d84511a94c1f9e0567a4cfad2ec3697c8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, placeholder } from '@prisma/orm-postgres/migration';
import { contractFromJson } from '@prisma/orm-postgres/static';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropCheckConstraint({
        schema: 'public',
        table: 'run',
        constraint: 'run_status_check_74f184cc',
      }),
      this.addColumn({
        schema: 'public',
        table: 'run',
        column: col('userId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(contractFromJson<End>(endContract), 'backfill-run-userId', {
        check: () => placeholder('backfill-run-userId:check'),
        run: () => placeholder('backfill-run-userId:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'run', column: 'userId' }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'run',
        constraint: 'run_status_check_373824bd',
        expression: "\"status\" IN ('Running', 'Success', 'Failed', 'NeedsInput')",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
