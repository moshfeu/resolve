import { EventstoreResourceAlreadyExistError } from 'resolve-eventstore-base'
import getLog from './get-log'
import {
  longNumberSqlType,
  longStringSqlType,
  customObjectSqlType
} from './constants'

const initEventStore = async ({
  events: { tableName, connection, database },
  escapeId
}) => {
  const log = getLog('initEventStore')

  log.debug(`initializing events database tables`)
  log.verbose(`tableName: ${tableName}`)

  const eventsTableNameAsId = escapeId(tableName)
  const threadsTableNameAsId = escapeId(`${tableName}-threads`)

  log.debug(`building a query`)
  const query = `CREATE TABLE ${eventsTableNameAsId}(
        \`threadId\` ${longNumberSqlType},
        \`threadCounter\` ${longNumberSqlType},
        \`timestamp\` ${longNumberSqlType},
        \`aggregateId\` ${longStringSqlType},
        \`aggregateVersion\` ${longNumberSqlType},
        \`type\` ${longStringSqlType},
        \`payload\` ${customObjectSqlType},
        PRIMARY KEY(\`threadId\`, \`threadCounter\`),
        UNIQUE KEY \`aggregate\`(\`aggregateId\`, \`aggregateVersion\`),
        INDEX USING BTREE(\`aggregateId\`),
        INDEX USING BTREE(\`aggregateVersion\`),
        INDEX USING BTREE(\`type\`),
        INDEX USING BTREE(\`timestamp\`)
      );
      
      CREATE TABLE ${threadsTableNameAsId}(
        \`threadId\` ${longNumberSqlType},
        \`threadCounter\` ${longNumberSqlType},
        PRIMARY KEY(\`threadId\`)
      );
  
      INSERT INTO ${threadsTableNameAsId}(
        \`threadId\`,
        \`threadCounter\`
      ) VALUES ${Array.from(new Array(256))
        .map((_, index) => `(${index}, 0)`)
        .join(',')}
      ;`

  try {
    log.debug(`executing query`)
    log.verbose(query)
    await connection.query(query)
    log.debug(`query executed successfully`)
  } catch (error) {
    if (error) {
      let errorToThrow = error
      if (/Table.*? already exists$/i.test(error.message)) {
        errorToThrow = new EventstoreResourceAlreadyExistError(
          `duplicate initialization of the mysql adapter with same events database "${database}" and table "${tableName}" not allowed`
        )
      } else {
        log.error(errorToThrow.message)
        log.verbose(errorToThrow.stack)
      }
      throw errorToThrow
    }
  }
}

export default initEventStore