#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8840302a12f56fa4fd3b00a3394f11321d3456280c841086162cf1030b6da2c1/contract';
import endContract from '../../snapshots/8840302a12f56fa4fd3b00a3394f11321d3456280c841086162cf1030b6da2c1/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/5cfd904a2a3ba11158e06acdedfae0d134b6faf47248ba02b81d6feb9586fbab/contract';
import startContract from '../../snapshots/5cfd904a2a3ba11158e06acdedfae0d134b6faf47248ba02b81d6feb9586fbab/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, placeholder } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'agent',
        column: col('userId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-agent-userId', {
        check: () => placeholder('backfill-agent-userId:check'),
        run: () => placeholder('backfill-agent-userId:run'),
      }),
      this.setNotNull({ schema: 'public', table: 'agent', column: 'userId' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
