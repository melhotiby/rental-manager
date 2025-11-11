import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM properties ORDER BY created_at DESC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      address,
      monthly_rent,
      property_management_percent,
      extra_monthly_expenses,
      hoa_fee,
      is_paid_off,
      is_rental,
      purchase_price,
      notes
    } = body

    const result = await pool.query(
      `INSERT INTO properties 
       (name, address, monthly_rent, property_management_percent, extra_monthly_expenses, 
        hoa_fee, is_paid_off, is_rental, purchase_price, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        address || '',
        monthly_rent,
        property_management_percent || 10,
        extra_monthly_expenses || 0,
        hoa_fee || 0,
        is_paid_off || false,
        is_rental !== undefined ? is_rental : true,
        purchase_price || 0,
        notes || ''
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
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
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM properties WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      name,
      address,
      monthly_rent,
      property_management_percent,
      extra_monthly_expenses,
      hoa_fee,
      is_paid_off,
      is_rental,
      purchase_price,
      notes
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE properties 
       SET name = $1, 
           address = $2, 
           monthly_rent = $3, 
           property_management_percent = $4, 
           extra_monthly_expenses = $5,
           hoa_fee = $6,
           is_paid_off = $7,
           is_rental = $8,
           purchase_price = $9,
           notes = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        name,
        address,
        monthly_rent,
        property_management_percent,
        extra_monthly_expenses || 0,
        hoa_fee,
        is_paid_off,
        is_rental !== undefined ? is_rental : true,
        purchase_price || 0,
        notes || '',
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}
