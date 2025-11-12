import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `SELECT * FROM payment_tracking 
       WHERE payment_month = $1 AND payment_year = $2
       ORDER BY created_at DESC`,
      [month, year]
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching payment tracking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment tracking' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      bill_type,
      bill_id,
      property_id,
      payment_month,
      payment_year,
      is_paid,
      paid_date,
      amount_paid,
      notes
    } = body

    // Check if tracking record already exists
    const existing = await pool.query(
      `SELECT id FROM payment_tracking 
       WHERE bill_type = $1 AND bill_id = $2 
       AND payment_month = $3 AND payment_year = $4`,
      [bill_type, bill_id, payment_month, payment_year]
    )

    let result

    if (existing.rows.length > 0) {
      // Update existing record
      result = await pool.query(
        `UPDATE payment_tracking 
         SET is_paid = $1,
             paid_date = $2,
             amount_paid = $3,
             notes = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE bill_type = $5 AND bill_id = $6 
         AND payment_month = $7 AND payment_year = $8
         RETURNING *`,
        [
          is_paid,
          paid_date,
          amount_paid,
          notes || '',
          bill_type,
          bill_id,
          payment_month,
          payment_year
        ]
      )
    } else {
      // Insert new record
      result = await pool.query(
        `INSERT INTO payment_tracking 
         (bill_type, bill_id, property_id, payment_month, payment_year, 
          is_paid, paid_date, amount_paid, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          bill_type,
          bill_id,
          property_id || null,
          payment_month,
          payment_year,
          is_paid,
          paid_date,
          amount_paid,
          notes || ''
        ]
      )
    }

    return NextResponse.json(result.rows[0], { status: 200 })
  } catch (error) {
    console.error('Error saving payment tracking:', error)
    return NextResponse.json(
      { error: 'Failed to save payment tracking' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM recurring_bills WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bill:', error)
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      property_id,
      name,
      amount,
      frequency,
      due_month,
      category,
      payment_link,
      notes,
      is_one_time,
      one_time_year,
      escrow_amount,
      is_active
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Bill ID is required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE recurring_bills 
       SET property_id = $1,
           name = $2,
           amount = $3,
           frequency = $4,
           due_month = $5,
           category = $6,
           payment_link = $7,
           notes = $8,
           is_one_time = $9,
           one_time_year = $10,
           escrow_amount = $11,
           is_active = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [
        property_id || null,
        name,
        amount,
        frequency || 'monthly',
        due_month || null,
        category || 'other',
        payment_link || '',
        notes || '',
        is_one_time || false,
        one_time_year || null,
        escrow_amount || 0,
        is_active !== undefined ? is_active : true,
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}
