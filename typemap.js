#! /usr/bin/env node

const { CodeGeneratorRequest, CodeGeneratorResponse, CodeGeneratorResponseError } = require('protoc-plugin')

const typemap = {
  1: 'double',
  2: 'float',
  3: 'int64',
  4: 'uint64',
  5: 'int32',
  6: 'fixed64',
  7: 'fixed32',
  8: 'bool',
  9: 'string',
  10: 'group',
  11: 'message',
  12: 'bytes',
  13: 'uint32',
  14: 'enum',
  15: 'sfixed32',
  16: 'sfixed64',
  17: 'sint32',
  18: 'sint64'
}

// this will build a typemap for a message
function getMap(messageTypes, name, depth=1, pathPrefix='', namePrefix='') {
  let out = {}

  for (const msg of messageTypes) {
    if (msg.name === name) {
      for (const field of msg.fieldList) {
        const t = typemap[field.type]
        if (!['group', 'message'].includes(t)){
          out[namePrefix + field.jsonName] = [pathPrefix, field.number].join('.') + `:${t}`
        } else if (depth > 0){
          out[namePrefix + field.jsonName] = [pathPrefix, field.number].join('.')
          out = {...out, ...getMap(messageTypes, field.typeName.split('.').pop(), depth-1, [pathPrefix, field.number].join('.'), `${namePrefix}${field.jsonName}.`)}
        }
      }
    }
  }

  return out
}

CodeGeneratorRequest()
  .then(req => {
    const r = req.toObject()
    
    if (!r.parameter) {
      throw new Error('type option is required. See README.')
    }

    let [targetName, targetDepth=1, targetPath=''] = r.parameter.split(',').map(d => d.trim())
    targetDepth = parseInt(targetDepth)

    console.error(`Using these options: ${JSON.stringify({targetName, targetDepth, targetPath})}`)

    const protos = r.protoFileList.filter(p => r.fileToGenerateList.indexOf(p.name) !== -1)
    return protos.map(proto => {
      console.error(`wrote to ${proto.pb_package}-typemap.json`)
      return {
        name: `${proto.pb_package}-typemap.json`,
        content: JSON.stringify(getMap(proto.messageTypeList, targetName, targetDepth,targetPath), null, 2)
      }
    })
  })
  .then(CodeGeneratorResponse())
  .catch(CodeGeneratorResponseError())

