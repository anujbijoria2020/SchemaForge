import { type Table, type Relationship } from '../store/schemaStore';

/**
 * Pure function to generate clean, dialect-specific SQL schema.
 * Supports "postgresql" and "mysql" dialects.
 */
export const generateSql = (
  tables: Table[],
  relationships: Relationship[],
  dialect: 'postgresql' | 'mysql' | 'sqlite' | 'mssql'
): string => {
  const quote = dialect === 'mysql' ? '`' : '"';
  const escape = (val: string) => `${quote}${val}${quote}`;

  const sqlLines: string[] = [];

  // Dialect specific header comments
  sqlLines.push(`-- SQL generated for database dialect: ${dialect}`);
  sqlLines.push(`-- Generated on: ${new Date().toISOString()}\n`);

  // 1. Generate CREATE TABLE statements
  tables.forEach((table) => {
    sqlLines.push(`CREATE TABLE ${escape(table.name)} (`);
    
    const columnDefinitions = table.columns.map((col) => {
      const parts: string[] = [escape(col.name)];
      const typeLower = col.dataType.toLowerCase();
      
      // Dialect-specific autoincrement strategy
      if (dialect === 'mysql') {
        if (col.isPrimaryKey && (typeLower === 'serial' || typeLower === 'bigserial' || typeLower === 'int' || typeLower === 'integer')) {
          parts.push('INT');
          parts.push('AUTO_INCREMENT');
        } else {
          parts.push(col.dataType);
        }
      } else {
        // postgresql
        parts.push(col.dataType);
      }

      // Nullability
      if (!col.isNullable) {
        parts.push('NOT NULL');
      }

      // Defaults
      if (col.defaultValue !== null && col.defaultValue !== undefined && col.defaultValue.trim() !== '') {
        const val = col.defaultValue.trim();
        const isFunc = val.includes('(') || ['now', 'current_timestamp', 'true', 'false', 'null'].includes(val.toLowerCase());
        
        if (isFunc) {
          parts.push(`DEFAULT ${val}`);
        } else {
          const isNum = !isNaN(Number(val));
          if (isNum) {
            parts.push(`DEFAULT ${val}`);
          } else {
            parts.push(`DEFAULT '${val.replace(/'/g, "''")}'`);
          }
        }
      }

      // Primary Key & Unique constraints
      if (col.isPrimaryKey) {
        parts.push('PRIMARY KEY');
      } else if (col.isUnique) {
        parts.push('UNIQUE');
      }

      // Inline Check Constraints
      if (col.checkExpr !== null && col.checkExpr !== undefined && col.checkExpr.trim() !== '') {
        parts.push(`CHECK (${col.checkExpr})`);
      }

      return `  ${parts.join(' ')}`;
    });

    sqlLines.push(columnDefinitions.join(',\n'));
    sqlLines.push(');\n');
  });

  // 2. Generate ALTER TABLE statements for foreign keys
  // This avoids any topological sorting issues and supports circular references
  relationships.forEach((rel) => {
    const sourceTable = tables.find((t) => t.id === rel.sourceTableId);
    const targetTable = tables.find((t) => t.id === rel.targetTableId);
    if (!sourceTable || !targetTable) return;

    const sourceCol = sourceTable.columns.find((c) => c.id === rel.sourceColumnId);
    const targetCol = targetTable.columns.find((c) => c.id === rel.targetColumnId);
    if (!sourceCol || !targetCol) return;

    const fkConstraintName = `fk_${sourceTable.name}_${sourceCol.name}`;
    let onDeleteAction = '';
    
    if (rel.onDelete) {
      onDeleteAction = ` ON DELETE ${rel.onDelete.toUpperCase().replace(/-/g, ' ')}`;
    }

    sqlLines.push(
      `ALTER TABLE ${escape(sourceTable.name)} ADD CONSTRAINT ${escape(fkConstraintName)} ` +
      `FOREIGN KEY (${escape(sourceCol.name)}) REFERENCES ${escape(targetTable.name)} (${escape(targetCol.name)})${onDeleteAction};`
    );
  });

  return sqlLines.join('\n');
};
