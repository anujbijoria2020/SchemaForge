// src/templates/tableTemplates.ts

const createColumn = (
  name: string,
  dataType: string,
  sortOrder: number,
  options?: {
    primaryKey?: boolean;
    unique?: boolean;
    nullable?: boolean;
    defaultValue?: string | null;
  }
) => ({
  id: crypto.randomUUID(),
  name,
  dataType,
  isNullable: options?.nullable ?? false,
  isPrimaryKey: options?.primaryKey ?? false,
  isUnique: options?.unique ?? false,
  defaultValue: options?.defaultValue ?? null,
  checkExpr: null,
  sortOrder,
});

export const tableTemplates = {
  authUser: {
    ui: {
      title: "Auth User",
      subtitle: "Email, Password",
      iconColor: "#2563EB",
    },

    table: {
      name: "users",
      color: "#2563EB",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("email", "varchar(255)", 2, {
          unique: true,
        }),
        createColumn("password", "varchar(255)", 3),
        createColumn("created_at", "timestamp", 4, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  product: {
    ui: {
      title: "Product",
      subtitle: "Price, Stock",
      iconColor: "#16A34A",
    },

    table: {
      name: "products",
      color: "#16A34A",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("name", "varchar(255)", 2),
        createColumn("sku", "varchar(100)", 3, {
          unique: true,
        }),
        createColumn("price", "decimal(10,2)", 4),
        createColumn("stock", "integer", 5, {
          defaultValue: "0",
        }),
        createColumn("description", "text", 6, {
          nullable: true,
        }),
        createColumn("created_at", "timestamp", 7, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  customer: {
    ui: {
      title: "Customer",
      subtitle: "Name, Email",
      iconColor: "#EA580C",
    },

    table: {
      name: "customers",
      color: "#EA580C",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("first_name", "varchar(100)", 2),
        createColumn("last_name", "varchar(100)", 3),
        createColumn("email", "varchar(255)", 4, {
          unique: true,
        }),
        createColumn("phone", "varchar(20)", 5, {
          nullable: true,
        }),
        createColumn("created_at", "timestamp", 6, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  order: {
    ui: {
      title: "Order",
      subtitle: "Customer, Total",
      iconColor: "#9333EA",
    },

    table: {
      name: "orders",
      color: "#9333EA",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("customer_id", "uuid", 2),
        createColumn("status", "varchar(50)", 3),
        createColumn("total_amount", "decimal(10,2)", 4),
        createColumn("ordered_at", "timestamp", 5, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  blogPost: {
    ui: {
      title: "Blog Post",
      subtitle: "Title, Content",
      iconColor: "#DC2626",
    },

    table: {
      name: "posts",
      color: "#DC2626",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("title", "varchar(255)", 2),
        createColumn("slug", "varchar(255)", 3, {
          unique: true,
        }),
        createColumn("content", "text", 4),
        createColumn("author_id", "uuid", 5),
        createColumn("published", "boolean", 6, {
          defaultValue: "false",
        }),
        createColumn("created_at", "timestamp", 7, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  task: {
    ui: {
      title: "Task",
      subtitle: "Status, Due Date",
      iconColor: "#0891B2",
    },

    table: {
      name: "tasks",
      color: "#0891B2",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("title", "varchar(255)", 2),
        createColumn("description", "text", 3, {
          nullable: true,
        }),
        createColumn("status", "varchar(30)", 4, {
          defaultValue: "'todo'",
        }),
        createColumn("due_date", "date", 5, {
          nullable: true,
        }),
        createColumn("created_at", "timestamp", 6, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  category: {
    ui: {
      title: "Category",
      subtitle: "Slug, Parent",
      iconColor: "#65A30D",
    },

    table: {
      name: "categories",
      color: "#65A30D",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("name", "varchar(150)", 2),
        createColumn("slug", "varchar(150)", 3, {
          unique: true,
        }),
        createColumn("parent_id", "uuid", 4, {
          nullable: true,
        }),
        createColumn("created_at", "timestamp", 5, {
          defaultValue: "now()",
        }),
      ],
    },
  },

  file: {
    ui: {
      title: "File",
      subtitle: "URL, Size",
      iconColor: "#0F766E",
    },

    table: {
      name: "files",
      color: "#0F766E",
      columns: [
        createColumn("id", "uuid", 1, {
          primaryKey: true,
          unique: true,
          defaultValue: "gen_random_uuid()",
        }),
        createColumn("filename", "varchar(255)", 2),
        createColumn("url", "text", 3),
        createColumn("mime_type", "varchar(100)", 4),
        createColumn("size", "integer", 5),
        createColumn("created_at", "timestamp", 6, {
          defaultValue: "now()",
        }),
      ],
    },
  },
};

export type TableTemplateKey = keyof typeof tableTemplates;