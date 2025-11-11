import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT rb.*, p.name as property_name 
       FROM recurring_bills rb
       LEFT JOIN properties p ON rb.property_id = p.id
       WHERE rb.is_active = true
       ORDER BY rb.created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
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

    const result = await pool.query(
      `INSERT INTO recurring_bills 
       (property_id, name, amount, frequency, due_month, category, 
        payment_link, notes, is_one_time, one_time_year, escrow_amount, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
        is_active !== undefined ? is_active : true
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { error: 'Failed to create bill' },
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
