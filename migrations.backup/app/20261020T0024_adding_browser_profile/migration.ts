#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2dc20101651e4a8b6c7c48b53f4bde9d84511a94c1f9e0567a4cfad2ec3697c8/contract';
import startContract from '../../snapshots/2dc20101651e4a8b6c7c48b53f4bde9d84511a94c1f9e0567a4cfad2ec3697c8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e72c4be79451c908be6ccb5946aa4295802a6f676202e85cd793262645f69e3d/contract';
import endContract from '../../snapshots/e72c4be79451c908be6ccb5946aa4295802a6f676202e85cd793262645f69e3d/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
