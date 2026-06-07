const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  validate,
  validateParams,
  IdParamSchema,
} = require('../../validators/common.validator');

const { createMessageSchema } = require('./message.validator');
const MessageController = require('./message.controller');

const router = express.Router();
const controller = new MessageController();

router.post('/', validate(createMessageSchema), controller.create);

router.get('/', controller.getAll);

router.delete('/:id', validateParams(IdParamSchema), controller.delete);

module.exports = router;
