

import type { PoolConnection, RowDataPacket, } from "mysql2/promise"

import {
   assertTempleUnique,
  countTemples,
  createTemple,
  // findAllTemples,


  findTempleById,
  softDeleteTemple,
  updateTemple,
   findTemplesByScope,
  type TempleAccessScope,
} from "../repositories/templeRepository"

import type {
  CreateTemplePayload,
  UpdateTemplePayload,
} from "../templeTypes"


/**
 * =========================================================
 * GENERATE SLUG
 * =========================================================
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
interface OrganizationTempleLimitRow
  extends RowDataPacket {
  id: number
  org_default_temples: number | null
}
/**
 * =========================================================
 * GET ORGANIZATION TEMPLE LIMIT
 * =========================================================
 *
 * Reads org_default_temples from organizations table.
 */



async function getOrganizationTempleLimit(
  connection: PoolConnection,
  organizationId: number,
): Promise<number> {
  const sql = `
    SELECT
      id,
      org_default_temples
    FROM organizations
    WHERE id = ?
      AND deleted_at IS NULL
    LIMIT 1
  `

  const [rows] =
    await connection.execute<OrganizationTempleLimitRow[]>(
      sql,
      [organizationId],
    )

  if (rows.length === 0) {
    throw new Error("Organization not found")
  }

  const limit = Number(
    rows[0].org_default_temples ?? 0,
  )

  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error(
      "Invalid organization temple limit",
    )
  }

  return limit
}



export async function getTempleLimitService(
  connection: PoolConnection,
  organizationId: number,
) {
  const limit = await getOrganizationTempleLimit(connection, organizationId)
  const used = await countTemples(connection, organizationId)
  return { limit, used, remaining: Math.max(0, limit - used) }
}

export async function createTempleService(
  connection: PoolConnection,
  organizationId: number,
  data: CreateTemplePayload,
) {
  // Check duplicate information first.
  await assertTempleUnique(
    connection,
    organizationId,
    "temp_name",
    data.temp_name,
  );

  await assertTempleUnique(
    connection,
    organizationId,
    "temp_registration_number",
    data.temp_registration_number,
  );

  await assertTempleUnique(
    connection,
    organizationId,
    "temp_gst_number",
    data.temp_gst_number,
  );

  await assertTempleUnique(
    connection,
    organizationId,
    "temp_email",
    data.temp_email,
  );

  await assertTempleUnique(
    connection,
    organizationId,
    "temp_phone",
    data.temp_phone,
  );

  const slug =
    data.temp_slug?.trim() ||
    generateSlug(data.temp_name);

  await assertTempleUnique(
    connection,
    organizationId,
    "temp_slug",
    slug,
  );

  // Enforce the organization's temple limit.
  const templeLimit = await getOrganizationTempleLimit(
    connection,
    organizationId,
  );

  const currentTempleCount = await countTemples(
    connection,
    organizationId,
  );

  if (currentTempleCount >= templeLimit) {
    throw new Error(
      `Temple limit reached. Your organization can have a maximum of ${templeLimit} temple(s).`,
    );
  }

  const templeId = await createTemple(
    connection,
    organizationId,
    {
      ...data,
      temp_slug: slug,
    },
  );

  return findTempleById(
    connection,
    organizationId,
    templeId,
  );
}

/**
 * =========================================================
 * GET ALL TEMPLES
 * =========================================================
 */

export async function getTemplesService(
  connection: PoolConnection,
  scope: TempleAccessScope,
  search = "",
) {
  return findTemplesByScope(connection, scope,  search,);
}
/**
 * =========================================================
 * GET SINGLE TEMPLE
 * =========================================================
 */
export async function getTempleService(
  connection: PoolConnection,
  organizationId: number,
  id: number,
) {
  return findTempleById(
    connection,
    organizationId,
    id,
  )
}

/**
 * =========================================================
 * UPDATE TEMPLE
 * =========================================================
 */





export async function updateTempleService(
  connection: PoolConnection,
  organizationId: number,
  id: number,
  data: UpdateTemplePayload,
) {
  const existing = await findTempleById(
    connection,
    organizationId,
    id,
  );

  if (!existing) {
    return null;
  }

  const updateData: UpdateTemplePayload = {
    ...data,
  };

  if (updateData.temp_name !== undefined) {
    await assertTempleUnique(
      connection,
      organizationId,
      "temp_name",
      updateData.temp_name,
      id,
    );
  }

  if (updateData.temp_registration_number !== undefined) {
    await assertTempleUnique(
      connection,
      organizationId,
      "temp_registration_number",
      updateData.temp_registration_number,
      id,
    );
  }

  if (updateData.temp_gst_number !== undefined) {
    await assertTempleUnique(
      connection,
      organizationId,
      "temp_gst_number",
      updateData.temp_gst_number,
      id,
    );
  }

  if (updateData.temp_email !== undefined) {
    await assertTempleUnique(
      connection,
      organizationId,
      "temp_email",
      updateData.temp_email,
      id,
    );
  }

  if (updateData.temp_phone !== undefined) {
    await assertTempleUnique(
      connection,
      organizationId,
      "temp_phone",
      updateData.temp_phone,
      id,
    );
  }

  if (updateData.temp_slug !== undefined) {
    await assertTempleUnique(
      connection,
      organizationId,
      "temp_slug",
      updateData.temp_slug,
      id,
    );
  } else if (updateData.temp_name !== undefined) {
    const slug = generateSlug(updateData.temp_name);

    await assertTempleUnique(
      connection,
      organizationId,
      "temp_slug",
      slug,
      id,
    );

    updateData.temp_slug = slug;
  }

  const updated = await updateTemple(
    connection,
    organizationId,
    id,
    updateData,
  );

  if (!updated) {
    return null;
  }

  return findTempleById(
    connection,
    organizationId,
    id,
  );
}

/**
 * =========================================================
 * DELETE TEMPLE
 * =========================================================
 */
export async function deleteTempleService(
  connection: PoolConnection,
  organizationId: number,
  id: number,
) {
  return softDeleteTemple(
    connection,
    organizationId,
    id,
  )
}