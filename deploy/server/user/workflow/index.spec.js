require('mocha')
const { assert, expect } = require('chai')
const sinon = require('sinon')
const express = require('express')
const request = require('request')
const uuidv4 = require('uuid/v4')

const masterStore = require('../store')
const router = require('./index')

const { USER_DIR_VOLUBA_DIR_NAME } = require('../constants')
const { WORKFLOW_VOLUBA_DIR_NAME } = require('./constants')

let server

const lsResult = [
  {
      "id": "0000000000000000000000000000000000000000",
      "type": "file",
      "name": "test1.c",
      "size": 0
  },
  {
      "id": "e4fe14c8cda2206bb9606907cf4fca6b30221cf9",
      "type": "dir",
      "name": "test_dir"
  }
  ]

const readFileResult = {
  "test":"hello world"
}

const saveBody = {
  "foo": "bar",
  "hello": "world"
}

const sandbox = sinon.createSandbox() 
const lsStub = sandbox.stub().resolves(lsResult)
const readFileStub = sandbox.stub().resolves(readFileResult)
const uploadFileStub = sandbox.stub().resolves()

const handle = {
  ls: lsStub,
  readFile: readFileStub,
  uploadFile: uploadFileStub
}
const getSeaFileStub = sinon.stub(masterStore, 'getSeafileHandle').resolves(handle)

describe('user/workflow/index.js', () => {

  before(() => {
    const app = express()
    app.use(router)
    server = app.listen(5000)
  })

  after(() => {
    server.close()
  })

  afterEach(() => {
    getSeaFileStub.resetHistory()
    lsStub.resetHistory()
    readFileStub.resetHistory()
  })
  
  
  it('GET /', done => {
    request.get({
      uri: 'http://localhost:5000'
    }, (err, resp, body) => {
      if (err) return done(err)
      if (resp.statusCode >= 400) return done(resp.statusCode)
      assert(getSeaFileStub.called)
      assert(lsStub.called)
      assert(lsStub.calledWith({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}` }))

      expect(JSON.parse(body)).to.be.deep.equal(lsResult)
      done()
    })
  })

  it('GET /:workflowId', done => {
    const id = uuidv4()
    request.get({
      uri: `http://localhost:5000/${id}`
    }, (err, resp, body) => {
      if (err) return done(err)
      if (resp.statusCode >= 400) return done(resp.statusCode)
      assert(readFileStub.calledWith({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}/${id}` }))
      expect(JSON.parse(body)).to.be.deep.equal(readFileResult)
      done()
    })
  })

  it('POST /', done => {
    request.post({
      uri: 'http://localhost:5000/',
      json: saveBody
    }, (err, resp, body) => {
      if (err) return done(err)
      if (resp.statusCode >= 400) return done(resp.statusCode)
      assert(uploadFileStub.called)
      assert(/^[a-f0-9\-]*?$/.test(body))
      done()
    })
  })

  it('POST /autosave', done => {
    request.post({
      uri: 'http://localhost:5000/autosave',
      json: saveBody
    }, (err, resp, body) => {
      if (err) return done(err)
      if (resp.statusCode >= 400) return done(resp.statusCode)
      assert(uploadFileStub.called)
      done()
    })
  })
})