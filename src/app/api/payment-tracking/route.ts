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
       ORDER BY created_at`,
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

    // Use UPSERT to avoid duplicates
    const result = await pool.query(
      `INSERT INTO payment_tracking 
       (bill_type, bill_id, property_id, payment_month, payment_year, is_paid, paid_date, amount_paid, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (bill_type, bill_id, payment_month, payment_year)
       DO UPDATE SET 
         is_paid = EXCLUDED.is_paid,
         paid_date = EXCLUDED.paid_date,
         amount_paid = EXCLUDED.amount_paid,
         notes = EXCLUDED.notes,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        bill_type,
        bill_id,
        property_id,
        payment_month,
        payment_year,
        is_paid,
        paid_date,
        amount_paid,
        notes
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error saving payment tracking:', error)
    return NextResponse.json(
      { error: 'Failed to save payment tracking' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, is_paid, paid_date, amount_paid, notes } = body

    const result = await pool.query(
      `UPDATE payment_tracking 
       SET is_paid = $1,
           paid_date = $2,
           amount_paid = $3,
           notes = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [is_paid, paid_date, amount_paid, notes, id]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating payment tracking:', error)
    return NextResponse.json(
      { error: 'Failed to update payment tracking' },
      { status: 500 }
    )
  }
}
