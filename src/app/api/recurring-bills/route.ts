import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    let query = `
      SELECT rb.*, p.name as property_name 
      FROM recurring_bills rb
      LEFT JOIN properties p ON rb.property_id = p.id
      WHERE rb.is_active = true
    `
    const params: any[] = []

    if (propertyId) {
      query += ' AND rb.property_id = $1'
      params.push(propertyId)
    }

    query += ' ORDER BY rb.due_month, rb.name'

    const result = await pool.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching recurring bills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring bills' },
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
      escrow_amount
    } = body

    const result = await pool.query(
      `INSERT INTO recurring_bills 
       (property_id, name, amount, frequency, due_month, category, payment_link, notes, is_one_time, one_time_year, escrow_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        property_id,
        name,
        amount,
        frequency,
        due_month,
        category,
        payment_link || '',
        notes || '',
        is_one_time || false,
        one_time_year,
        escrow_amount || 0
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating recurring bill:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring bill' },
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
    console.error('Error deleting recurring bill:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring bill' },
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
      is_active,
      escrow_amount
    } = body

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
           is_active = $9,
           escrow_amount = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        property_id,
        name,
        amount,
        frequency,
        due_month,
        category,
        payment_link,
        notes,
        is_active,
        escrow_amount,
        id
      ]
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating recurring bill:', error)
    return NextResponse.json(
      { error: 'Failed to update recurring bill' },
      { status: 500 }
    )
  }
}
