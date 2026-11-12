#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/e72c4be79451c908be6ccb5946aa4295802a6f676202e85cd793262645f69e3d/contract';
import startContract from '../../snapshots/e72c4be79451c908be6ccb5946aa4295802a6f676202e85cd793262645f69e3d/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/ea1c7c0d62a0b585d7e8286ac11035fc3af05bd5f15813415cd095be412be67d/contract';
import endContract from '../../snapshots/ea1c7c0d62a0b585d7e8286ac11035fc3af05bd5f15813415cd095be412be67d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addUnique({
        schema: 'public',
        table: 'agent',
        constraint: 'agent_id_key',
        columns: ['id'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
