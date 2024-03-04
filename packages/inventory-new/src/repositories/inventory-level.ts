import { Context } from "@medusajs/types"
import { InventoryLevel } from "@models"
import { SqlEntityManager } from "@mikro-orm/postgresql"
import { mikroOrmBaseRepositoryFactory } from "@medusajs/utils"

export class InventoryLevelRepository extends mikroOrmBaseRepositoryFactory(
  InventoryLevel
) {
  async getReservedQuantity(
    inventoryItemId: string,
    locationIds: string[],
    context: Context = {}
  ): Promise<number> {
    const manager = super.getActiveManager<SqlEntityManager>(context)

    const result = manager
      .getKnex()({ il: "inventory_level" })
      .sum("il.reserved_quantity")
      .where((q) => {
        q.orWhere("il.inventory_item_id", "=", inventoryItemId)
        q.orWhereIn("il.location_id", locationIds)
      })

    console.warn(result)

    return 0
  }
}
