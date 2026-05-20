import { pool } from '../../config/databese';
import { AppError } from '../../utils/apperror';

export const createNewIssue = async (body: any, reporterId: number) => {
  const { title, description, type } = body;
  const result = await pool.query(
    'INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING id, title, description, type, status, reporter_id, created_at, updated_at',
    [title, description, type, reporterId]
  );
  return result.rows[0];
};

export const getAllIssuesList = async (queryParams: any) => {
  const { sort = 'newest', type, status } = queryParams;
  
  let baseQuery = 'SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues';
  const conditions: string[] = [];
  const params: any[] = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (conditions.length > 0) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const orderBy = sort === 'oldest' ? 'ASC' : 'DESC';
  baseQuery += ` ORDER BY created_at ${orderBy}`;

  const issuesResult = await pool.query(baseQuery, params);
  const issues = issuesResult.rows;

  if (issues.length === 0) return [];

  // Strictly avoiding SQL JOINs: Fetch reporters via batched application layer operations
  const reporterIds = Array.from(new Set(issues.map(issue => issue.reporter_id)));
  const usersResult = await pool.query(
    'SELECT id, name, role FROM users WHERE id = ANY($1)',
    [reporterIds]
  );

  const userMap = new Map(usersResult.rows.map(user => [user.id, user]));

  return issues.map(issue => {
    const reporter = userMap.get(issue.reporter_id) || null;
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
};

export const getSingleIssueById = async (id: number) => {
  const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
  if (issueResult.rowCount === 0) {
    throw new AppError(404, 'Not Found: Issue tracking record not found');
  }
  const issue = issueResult.rows[0];

  const userResult = await pool.query('SELECT id, name, role FROM users WHERE id = $1', [issue.reporter_id]);
  const reporter =
  (userResult.rowCount ?? 0) > 0
    ? userResult.rows[0]
    : null;

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};

export const patchIssueData = async (id: number, body: any, user: any) => {
  const issueResult = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
  if (issueResult.rowCount === 0) {
    throw new AppError(404, 'Not Found: Issue tracking record not found');
  }
  const issue = issueResult.rows[0];

  // Business access permission matrix check
  if (user.role !== 'maintainer') {
    if (issue.reporter_id !== user.id) {
      throw new AppError(403, 'Forbidden: You are not authorized to access or modify this issue');
    }
    if (issue.status !== 'open') {
      throw new AppError(409, 'Conflict: Contributors can only update issues with an open status');
    }
  }

  const title = body.title !== undefined ? body.title : issue.title;
  const description = body.description !== undefined ? body.description : issue.description;
  const type = body.type !== undefined ? body.type : issue.type;
  const status = body.status !== undefined ? body.status : issue.status;

  const updateResult = await pool.query(
    'UPDATE issues SET title = $1, description = $2, type = $3, status = $4 WHERE id = $5 RETURNING id, title, description, type, status, reporter_id, created_at, updated_at',
    [title, description, type, status, id]
  );

  return updateResult.rows[0];
};

export const removeIssueRecord = async (id: number) => {
  const result = await pool.query('DELETE FROM issues WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw new AppError(404, 'Not Found: Issue record does not exist');
  }
  return true;
};