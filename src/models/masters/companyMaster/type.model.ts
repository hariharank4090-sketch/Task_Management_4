import {
  Model,
  DataTypes,
  Optional
} from "sequelize";
import {sequelize} from "../../../config/sequalizer";

/**
 * Attributes interface
 */
interface CompanyAttributes {
  Company_id: number;
  Company_Code?: string;
  Company_Name?: string;
  Company_Address?: string;
  State?: string;
  Region?: string;
  Pincode?: string;
  Country?: string;
  VAT_TIN_Number?: string;
  PAN_Number?: string;
  CST_Number?: string;
  CIN_Number?: string;
  Service_Tax_Number?: string;
  MSME_Number?: string;
  NSIC_Number?: string;
  Account_Number?: string;
  IFC_Code?: string;
  Bank_Branch_Name?: string;
  Bank_Name?: string;
  Telephone_Number?: string;
  Support_Number?: string;
  Mail?: string;
  Website?: string;
  Gst_Number?: string;
  State_Code?: string;
  State_No?: string;
  Entry_By?: number;
  Entry_Date?: Date;
  Modified_By?: number;
  Modified_Date?: Date;
  Del_Flag?: number;
  Deleted_By?: number;
  Deleted_Date?: Date;
}

/**
 * Creation attributes
 */
type CompanyCreationAttributes = Optional<
  CompanyAttributes,
  "Company_id"
>;

/**
 * Model class
 */
class Company_Master
  extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes
{
  public Company_id!: number;
  public Company_Code!: string;
  public Company_Name!: string;
  public Company_Address!: string;
  public State!: string;
  public Region!: string;
  public Pincode!: string;
  public Country!: string;
  public VAT_TIN_Number!: string;
  public PAN_Number!: string;
  public CST_Number!: string;
  public CIN_Number!: string;
  public Service_Tax_Number!: string;
  public MSME_Number!: string;
  public NSIC_Number!: string;
  public Account_Number!: string;
  public IFC_Code!: string;
  public Bank_Branch_Name!: string;
  public Bank_Name!: string;
  public Telephone_Number!: string;
  public Support_Number!: string;
  public Mail!: string;
  public Website!: string;
  public Gst_Number!: string;
  public State_Code!: string;
  public State_No!: string;
  public Entry_By!: number;
  public Entry_Date!: Date;
  public Modified_By!: number;
  public Modified_Date!: Date;
  public Del_Flag!: number;
  public Deleted_By!: number;
  public Deleted_Date!: Date;
}

/**
 * Table initialization
 */
Company_Master.init(
  {
    Company_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Company_Code: {
      type: DataTypes.STRING(50)
    },
    Company_Name: {
      type: DataTypes.STRING(150)
    },
    Company_Address: {
      type: DataTypes.TEXT
    },
    State: {
      type: DataTypes.STRING(50)
    },
    Region: {
      type: DataTypes.STRING(50)
    },
    Pincode: {
      type: DataTypes.STRING(10)
    },
    Country: {
      type: DataTypes.STRING(50)
    },
    VAT_TIN_Number: {
      type: DataTypes.STRING(50)
    },
    PAN_Number: {
      type: DataTypes.STRING(50)
    },
    CST_Number: {
      type: DataTypes.STRING(50)
    },
    CIN_Number: {
      type: DataTypes.STRING(50)
    },
    Service_Tax_Number: {
      type: DataTypes.STRING(50)
    },
    MSME_Number: {
      type: DataTypes.STRING(50)
    },
    NSIC_Number: {
      type: DataTypes.STRING(50)
    },
    Account_Number: {
      type: DataTypes.STRING(50)
    },
    IFC_Code: {
      type: DataTypes.STRING(50)
    },
    Bank_Branch_Name: {
      type: DataTypes.STRING(100)
    },
    Bank_Name: {
      type: DataTypes.STRING(100)
    },
    Telephone_Number: {
      type: DataTypes.STRING(20)
    },
    Support_Number: {
      type: DataTypes.STRING(20)
    },
    Mail: {
      type: DataTypes.STRING(100)
    },
    Website: {
      type: DataTypes.STRING(100)
    },
    Gst_Number: {
      type: DataTypes.STRING(50)
    },
    State_Code: {
      type: DataTypes.STRING(10)
    },
    State_No: {
      type: DataTypes.STRING(10)
    },
    Entry_By: {
      type: DataTypes.INTEGER
    },
    Entry_Date: {
      type: DataTypes.DATE
    },
    Modified_By: {
      type: DataTypes.INTEGER
    },
    Modified_Date: {
      type: DataTypes.DATE
    },
    Del_Flag: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    Deleted_By: {
      type: DataTypes.INTEGER
    },
    Deleted_Date: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    tableName: "tbl_Company_Master",
    timestamps: false
  }
);

export default Company_Master;
