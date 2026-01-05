import express from 'express';


//taskType

import taskTypeRoutes from './taskType.routes';
import projectRoutes from './project.routes';       
import taskAssignRoutes from './taskAssign.route' 
//accounting
// import accoutRoutes from './accounting/accounts.route';
// import accountGroupRoutes from './accounting/accountGroup.route';
// import costCenterRoutes from './accounting/costCenter.route';
// import costCategoryRoutes from './accounting/costCategory.route';
// import voucherRoutes from './accounting/voucher.route';

// //products
// import productGroupRoutes from './product/productGroup.route';
// import brandRoutes from './product/brand.route';
// import packRoutes from './product/packs.route';
// import unitRoutes from './product/units.route';
// import productRoutes from './product/products.route';
// import godownRoutes from './product/godown.route';

// //users
// import userRoutes from './users/users.route';
// import areaRoutes from './users/area.route';
// import districtRoutes from './users/district.route';
// import stateRoutes from './users/state.route';
// import routeRoutes from './users/routes.route';
// import branchRoutes from './users/branch.route';
// import userTypeRoutes from './users/userType.route';
// import retailerRoutes from './users/retailer.route';

const router = express.Router();

//taskType
router.use('/taskType', taskTypeRoutes)

router.use('/project',projectRoutes)

router.use('/projectAssign',taskAssignRoutes)

// //accounting
// router.use('/accounts', accoutRoutes);
// router.use('/accountGroup', accountGroupRoutes);
// router.use('/costCenter', costCenterRoutes);
// router.use('/costCategory', costCategoryRoutes);
// router.use('/voucher', voucherRoutes);

// //products
// router.use('/productGroup', productGroupRoutes);
// router.use('/brand', brandRoutes);
// router.use('/packs', packRoutes);
// router.use('/units', unitRoutes);
// router.use('/products', productRoutes);
// router.use('/godown', godownRoutes);

// //users
// router.use('/users', userRoutes);
// router.use('/area', areaRoutes);
// router.use('/district', districtRoutes);
// router.use('/state', stateRoutes);
// router.use('/route', routeRoutes);
// router.use('/branch', branchRoutes);
// router.use('/userType', userTypeRoutes);
// router.use('/retailer', retailerRoutes);

export default router;