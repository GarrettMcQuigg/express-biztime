const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async (req, res, next) => {
  try {
    let result = await db.query(`
        SELECT * FROM invoices`);
    return res.json({ invoices: result.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;

    let result = await db.query(
      `
        SELECT
        i.id,
        i.comp_code,
        i.amt,
        i.paid,
        i.add_date,
        i.paid_date,
        c.code,
        c.name,
        c.description
        FROM invoices AS i
        INNER JOIN companies AS c
        ON (i.comp_code = c.code)
        WHERE id = $1`,
      [id]
    );

    const data = result.rows;
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      add_date: data.add_date,
      paid_date: data.paid_date,
    };

    return res.json({ invoice: invoice });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
       VALUES ($1, $2)
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let { amt, paid } = req.body;
    let id = req.params.id;
    let paidDate = null;

    const prevResult = await db.query(
      `SELECT paid
       FROM invoices
       WHERE id=$1`,
      [id]
    );

    if (prevResult.rows.length === 0) {
      throw new ExpressError(`Invoice was not found.`, 404);
    }

    const prevPaidDate = prevResult.rows[0].paid_date;

    if (!prevPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = prevPaidDate;
    }

    const result = db.query(
      `UPDATE invoices
       SET amt=$1, paid=$2, paid_date=$3
       WHERE id=$4
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    let id = req.params.id;

    let result = await db.query(
      `DELETE FROM invoices
       WHERE id=$1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`${id} could not be found.`, 404);
    }

    return res.json({ invoice: `invoice ${id} has been deleted` });
  } catch (e) {
    return next(e);
  }
});
