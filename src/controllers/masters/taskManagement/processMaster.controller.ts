import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ZodError } from 'zod';

import {
  processMasterCreateSchema,
  processMasterUpdateSchema,
  processMasterIdSchema,
  processMasterQuerySchema,
  ProcessMasterCreateInput,
  ProcessMasterUpdateInput,
  ProcessMasterQueryParams,
  Process_Master
} from '../../../models/masters/process/type.model';

import {
  created,
  updated,
  deleted,
  notFound,
  sentData,
  servError
} from '../../../responseObject';

/* ================= ZOD VALIDATION HELPER ================= */

const validateWithZod = <T>(schema: any, data: any) => {
  try {
    return { success: true, data: schema.parse(data) as T };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false,
        errors: err.issues.map(e => ({
          field: e.path.join('.') || 'unknown',
          message: e.message
        }))
      };
    }
    return { success: false };
  }
};

/* ================= GET ALL ================= */

export const getAllProcessMaster = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<ProcessMasterQueryParams>(
      processMasterQuerySchema,
      req.query
    );

    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { page, limit, search, sortBy, sortOrder } = validation.data!;

    const where: any = {};
    if (search) {
      where.Process_Name = { [Op.like]: `%${search}%` };
    }

    const { rows, count } = await Process_Master.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [[sortBy, sortOrder]]
    });

    return sentData(res, rows, {
      totalRecords: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });

  } catch (e) {
    console.error(e);
    servError(e, res);
  }
};

/* ================= GET BY ID ================= */

export const getProcessMasterById = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<{ id: number }>(
      processMasterIdSchema,
      req.params
    );

    if (!validation.success) {
      return res.status(400).json({ success: false });
    }

    const process = await Process_Master.findByPk(validation.data!.id);
    if (!process) return notFound(res, 'Process not found');

    return res.status(200).json({ success: true, data: process });

  } catch (e) {
    servError(e, res);
  }
};

/* ================= CREATE ================= */

export const createProcessMaster = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<ProcessMasterCreateInput>(
      processMasterCreateSchema,
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const exists = await Process_Master.findOne({
      where: {
        Process_Name: validation.data!.Process_Name
      }
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Process name already exists'
      });
    }

    const process = await Process_Master.create(validation.data!);
    return created(res, process, 'Process created successfully');

  } catch (e) {
    servError(e, res);
  }
};

/* ================= UPDATE ================= */

export const updateProcessMaster = async (req: Request, res: Response) => {
  try {
    const idValidation = validateWithZod<{ id: number }>(
      processMasterIdSchema,
      req.params
    );

    if (!idValidation.success) {
      return res.status(400).json({ success: false });
    }

    const bodyValidation = validateWithZod<ProcessMasterUpdateInput>(
      processMasterUpdateSchema,
      req.body
    );

    if (!bodyValidation.success) {
      return res.status(400).json({ success: false, errors: bodyValidation.errors });
    }

    const process = await Process_Master.findByPk(idValidation.data!.id);
    if (!process) return notFound(res, 'Process not found');

    // duplicate name check
    if (bodyValidation.data!.Process_Name) {
      const duplicate = await Process_Master.findOne({
        where: {
          Process_Name: bodyValidation.data!.Process_Name,
          Id: { [Op.ne]: process.Id }
        }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Process name already exists'
        });
      }
    }

    await process.update(bodyValidation.data!);
    return updated(res, process, 'Process updated successfully');

  } catch (e) {
    servError(e, res);
  }
};

/* ================= DELETE ================= */

export const deleteProcessMaster = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<{ id: number }>(
      processMasterIdSchema,
      req.params
    );

    if (!validation.success) {
      return res.status(400).json({ success: false });
    }

    const process = await Process_Master.findByPk(validation.data!.id);
    if (!process) return notFound(res, 'Process not found');

    await process.destroy();
    return deleted(res, 'Process deleted successfully');

  } catch (e) {
    servError(e, res);
  }
};
