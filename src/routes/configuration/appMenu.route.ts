import express from 'express';
import appMenu from '../../controllers/configuration/menuManagement/index';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management APIs
 */

/**
 * @swagger
 * /api/configuration/appMenu:
 *   get:
 *     summary: Get all menus
 *     description: Fetch all menu items ordered by sort order and title
 *     tags: [Menu]
 *     responses:
 *       200:
 *         description: Menu list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Dashboard
 *                       slug:
 *                         type: string
 *                         example: dashboard
 *                       parentId:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       sortOrder:
 *                         type: integer
 *                         example: 1
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Server error
 */
router.get('/', appMenu.getMenu);

/**
 * @swagger
 * /api/configuration/appMenu:
 *   post:
 *     summary: Create a new menu
 *     description: Create a new menu item
 *     tags: [Menu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *             properties:
 *               title:
 *                 type: string
 *                 example: Reports
 *               slug:
 *                 type: string
 *                 example: reports
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               sortOrder:
 *                 type: integer
 *                 example: 2
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Menu created successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Slug already exists
 *       500:
 *         description: Server error
 */
router.post('/', appMenu.createMenu);

/**
 * @swagger
 * /api/configuration/appMenu/{id}:
 *   put:
 *     summary: Update a menu
 *     description: Update an existing menu item
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Menu
 *               slug:
 *                 type: string
 *                 example: updated-menu
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               sortOrder:
 *                 type: integer
 *                 example: 3
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Menu updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input or cycle detected
 *       404:
 *         description: Menu not found
 *       500:
 *         description: Server error
 */
router.put('/:id', appMenu.updateMenu);

export default router;
