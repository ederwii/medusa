import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "../../../types/routing"

import {
  ContainerRegistrationKeys,
  remoteQueryObjectFromString,
} from "@medusajs/utils"
import { createProductTypesWorkflow } from "@medusajs/core-flows"
import { refetchProductType } from "./helpers"
import {
  AdminCreateProductTypeType,
  AdminGetProductTypesParamsType,
} from "./validators"
import { HttpTypes } from "@medusajs/types"

export const GET = async (
  req: AuthenticatedMedusaRequest<AdminGetProductTypesParamsType>,
  res: MedusaResponse<HttpTypes.AdminProductTypeListResponse>
) => {
  const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
  const queryObject = remoteQueryObjectFromString({
    entryPoint: "product_type",
    variables: {
      filters: req.filterableFields,
      ...req.remoteQueryConfig.pagination,
    },
    fields: req.remoteQueryConfig.fields,
  })

  const { rows: product_types, metadata } = await remoteQuery(queryObject)

  res.json({
    product_types: product_types,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  })
}

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateProductTypeType>,
  res: MedusaResponse<HttpTypes.AdminProductTypeResponse>
) => {
  const input = [req.validatedBody]

  const { result } = await createProductTypesWorkflow(req.scope).run({
    input: { product_types: input },
  })

  const productType = await refetchProductType(
    result[0].id,
    req.scope,
    req.remoteQueryConfig.fields
  )

  res.status(200).json({ product_type: productType })
}