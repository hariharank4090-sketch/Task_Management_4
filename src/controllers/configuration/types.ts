export interface MenuRowDB {
    MenuId: number;
    ParentId: number | null;
    Slug: string;
    Title: string;
    IconKey: string | null;
    MenuType: number | null;
    IsActive: boolean | number | null;
    IsVisible: boolean | number | null;
    SortOrder: number | null;
    ComponentKey: string | null;
}

export interface MenuPayload {
    parentId: number | null;
    slug: string;
    title: string;
    iconKey: string | null;
    menuType: number;
    isActive: boolean;
    isVisible: boolean;
    sortOrder: number | null;
    componentKey: string | null;
}

export interface ApiMenuRow {
    menuId: number;
    parentId: number | null;
    slug: string;
    title: string;
    iconKey: string | null;
    menuType: number | null;
    isActive: boolean;
    isVisible: boolean;
    sortOrder: number | null;
    componentKey: string | null;
}

export function mapDbToApi(r: MenuRowDB): ApiMenuRow {
    return {
        menuId: r.MenuId,
        parentId: r.ParentId ?? null,
        slug: r.Slug,
        title: r.Title,
        iconKey: r.IconKey ?? null,
        menuType: (r.MenuType ?? 0) as number,
        isActive: !!r.IsActive,
        isVisible: !!r.IsVisible,
        sortOrder: r.SortOrder ?? null,
        componentKey: r.ComponentKey ?? null,
    };
}

export type DbUser = {
    Global_User_ID: number;
    Local_User_ID: number | null;
    Company_Id: number | null;
    Name: string | null;
    Password: string;
    UserTypeId: number | null;
    UserName: string;
    UDel_Flag: number | boolean | null;
    Created: Date | null;
    Updated: Date | null;
};

