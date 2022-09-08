import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { Logger } from '@graphprotocol/common-ts'
import { DocumentNode, print } from 'graphql'
import { CombinedError } from '@urql/core'
import { QueryResult } from './network-subgraph'
export interface BlockOracleSubgraphCreateOptions {
  logger: Logger
  endpoint: string
}

interface BlockOracleSubgraphOptions {
  logger: Logger
  endpoint: string
}

export class BlockOracleSubgraph {
  logger: Logger
  endpointClient: AxiosInstance

  private constructor(options: BlockOracleSubgraphOptions) {
    this.logger = options.logger

    this.endpointClient = axios.create({
      baseURL: options.endpoint,
      headers: { 'content-type': 'application/json' },

      // Don't parse responses as JSON
      responseType: 'text',

      // Don't transform responses
      transformResponse: (data) => data,
    })
  }

  public static async create({
    logger: parentLogger,
    endpoint,
  }: BlockOracleSubgraphCreateOptions): Promise<BlockOracleSubgraph> {
    const logger = parentLogger.child({
      component: 'BlockOracleSubgraph',
      endpoint,
    })

    // Create the EpochBlock subgraph instance
    const blockOracleSubgraph = new BlockOracleSubgraph({
      logger,
      endpoint,
    })
    // Any checks to be made after creating?

    return blockOracleSubgraph
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<Data = any>(
    query: DocumentNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variables?: Record<string, any>,
  ): Promise<QueryResult<Data>> {
    const response = await this.endpointClient.post('', {
      query: print(query),
      variables,
    })
    const data = JSON.parse(response.data)
    if (data.errors) {
      return { error: new CombinedError({ graphQLErrors: data.errors }) }
    }
    return data
  }

  async queryRaw(body: string): Promise<AxiosResponse> {
    return await this.endpointClient.post('', body)
  }
}
