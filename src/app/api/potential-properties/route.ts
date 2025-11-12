import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT * FROM potential_properties 
       ORDER BY created_at DESC`
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching potential properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch potential properties' },
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
      purchase_price,
      is_cash_purchase,
      down_payment_percent,
      interest_rate,
      loan_term_years,
      estimated_monthly_rent,
      property_tax_annual,
      insurance_annual,
      hoa_monthly,
      property_management_percent,
      maintenance_monthly,
      other_expenses_monthly,
      notes,
      status
    } = body

    const result = await pool.query(
      `INSERT INTO potential_properties 
       (name, address, purchase_price, is_cash_purchase, down_payment_percent, interest_rate, 
        loan_term_years, estimated_monthly_rent, property_tax_annual, 
        insurance_annual, hoa_monthly, property_management_percent, 
        maintenance_monthly, other_expenses_monthly, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        name,
        address || '',
        purchase_price,
        is_cash_purchase || false,
        down_payment_percent || 20,
        interest_rate || 7,
        loan_term_years || 30,
        estimated_monthly_rent,
        property_tax_annual || 0,
        insurance_annual || 0,
        hoa_monthly || 0,
        property_management_percent || 10,
        maintenance_monthly || 0,
        other_expenses_monthly || 0,
        notes || '',
        status || 'analyzing'
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating potential property:', error)
    return NextResponse.json(
      { error: 'Failed to create potential property' },
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
      purchase_price,
      is_cash_purchase,
      down_payment_percent,
      interest_rate,
      loan_term_years,
      estimated_monthly_rent,
      property_tax_annual,
      insurance_annual,
      hoa_monthly,
      property_management_percent,
      maintenance_monthly,
      other_expenses_monthly,
      notes,
      status
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      `UPDATE potential_properties 
       SET name = $1,
           address = $2,
           purchase_price = $3,
           is_cash_purchase = $4,
           down_payment_percent = $5,
           interest_rate = $6,
           loan_term_years = $7,
           estimated_monthly_rent = $8,
           property_tax_annual = $9,
           insurance_annual = $10,
           hoa_monthly = $11,
           property_management_percent = $12,
           maintenance_monthly = $13,
           other_expenses_monthly = $14,
           notes = $15,
           status = $16,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $17
       RETURNING *`,
      [
        name,
        address || '',
        purchase_price,
        is_cash_purchase || false,
        down_payment_percent || 20,
        interest_rate || 7,
        loan_term_years || 30,
        estimated_monthly_rent,
        property_tax_annual || 0,
        insurance_annual || 0,
        hoa_monthly || 0,
        property_management_percent || 10,
        maintenance_monthly || 0,
        other_expenses_monthly || 0,
        notes || '',
        status || 'analyzing',
        id
      ]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating potential property:', error)
    return NextResponse.json(
      { error: 'Failed to update potential property' },
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

    await pool.query('DELETE FROM potential_properties WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting potential property:', error)
    return NextResponse.json(
      { error: 'Failed to delete potential property' },
      { status: 500 }
    )
  }
}
