const express = require("express");
const slugify = require("slugify");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT code, name FROM companies ORDER BY DESC`
    );
    return res.json({ companies: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    let code = req.params.code;

    const result = await db.query(
      `SELECT c.code,
       c.name,
       c.description,
       i.id,
       i.comp_code,
       i.amt,
       i.paid,
       i.add_date,
       i.paid_date FROM companies AS c
       INNER JOIN invoices AS i 
       WHERE code=$1`,
      [code]
    );

    const data = result.rows[0];
    const company = {
      code: data.code,
      name: data.name,
      description: data.description,
      invoice: {
        id: data.id,
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
      },
    };

    if (result.rows.length === 0) {
      throw new ExpressError(`Company ${code} cannot be found.`, 404);
    }

    return res.json({ company: company });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true });

    const result = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
      [code, name, description]
    );
    return res.json({ company: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    let { name, description } = res.body;
    let code = req.params.code;

    const result = await db.query(
      `UPDATE companies
       SET name=$1, description=$2,
       WHERE code=$3
       RETURNING code, name, description`,
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`${code} does not exist`, 404);
    } else {
      return res.json({ company: result.rows });
    }
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    let code = req.params.code;

    let result = await db.query(
      `
    DELETE FROM companies
    WHERE code=$1
    RETURNING code
    `,
      [code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`${code} does not exist`, 404);
    }

    return res.json({ status: `${code} has been deleted.` });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
