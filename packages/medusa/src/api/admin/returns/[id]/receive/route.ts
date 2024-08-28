import {
  beginReceiveReturnWorkflow,
  cancelReturnReceiveWorkflow,
} from "@medusajs/core-flows"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  promiseAll,
  remoteQueryObjectFromString,
} from "@medusajs/utils"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "../../../../../types/routing"
import { AdminPostReceiveReturnsReqSchemaType } from "../../validators"
import { DeleteResponse, HttpTypes } from "@medusajs/types"

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminPostReceiveReturnsReqSchemaType>,
  res: MedusaResponse<HttpTypes.AdminOrderReturnResponse>
) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
  const orderModuleService = req.scope.resolve(ModuleRegistrationName.ORDER)

  const { id } = req.params

  const workflow = beginReceiveReturnWorkflow(req.scope)
  const { result } = await workflow.run({
    input: {
      ...req.validatedBody,
      return_id: id,
    },
  })

  const queryObject = remoteQueryObjectFromString({
    entryPoint: "return",
    variables: {
      id: result.return_id,
      filters: {
        ...req.filterableFields,
      },
    },
    fields: req.remoteQueryConfig.fields,
  })

  const [order, orderReturn] = await promiseAll([
    orderModuleService.retrieveOrder(result.order_id),
    remoteQuery(queryObject),
  ])

  res.json({
    order,
    return: orderReturn[0],
  })
}

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<DeleteResponse<"return">>
) => {
  const { id } = req.params

  await cancelReturnReceiveWorkflow(req.scope).run({
    input: {
      return_id: id,
    },
  })

  res.status(200).json({
    id,
    object: "return",
    deleted: true,
  })
}