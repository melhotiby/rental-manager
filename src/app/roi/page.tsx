// src/app/roi/page.tsx - ROI Analysis for Potential Properties
'use client'

import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  Select,
  useToast,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Checkbox
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import {
  Home,
  TrendingUp,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  BarChart3,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar
} from 'lucide-react'

interface PotentialProperty {
  id?: number
  name: string
  address: string
  purchase_price: number
  down_payment_percent: number
  interest_rate: number
  loan_term_years: number
  estimated_monthly_rent: number
  property_tax_annual: number
  insurance_annual: number
  hoa_monthly: number
  property_management_percent: number
  maintenance_monthly: number
  other_expenses_monthly: number
  notes: string
  status: string
  is_cash_purchase: boolean
}

interface ROICalculation {
  monthlyMortgage: number
  downPayment: number
  loanAmount: number
  monthlyPropertyTax: number
  monthlyInsurance: number
  totalMonthlyExpenses: number
  propertyManagementFee: number
  monthlyCashFlow: number
  annualCashFlow: number
  cashOnCashReturn: number
  capRate: number
  totalInvestment: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  ratingColor: string
}

export default function ROIAnalysis() {
  const [properties, setProperties] = useState<PotentialProperty[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] =
    useState<PotentialProperty | null>(null)

  const toast = useToast()

  // Form fields
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [isCashPurchase, setIsCashPurchase] = useState(false)
  const [downPaymentPercent, setDownPaymentPercent] = useState('20')
  const [interestRate, setInterestRate] = useState('7')
  const [loanTermYears, setLoanTermYears] = useState('30')
  const [estimatedRent, setEstimatedRent] = useState('')
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState('')
  const [insuranceAnnual, setInsuranceAnnual] = useState('')
  const [hoaMonthly, setHoaMonthly] = useState('0')
  const [propertyManagementPercent, setPropertyManagementPercent] =
    useState('10')
  const [maintenanceMonthly, setMaintenanceMonthly] = useState('0')
  const [otherExpensesMonthly, setOtherExpensesMonthly] = useState('0')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('analyzing')

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      const res = await fetch('/api/potential-properties')
      const data = await res.json()
      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
    }
  }

  const calculateMortgagePayment = (
    principal: number,
    annualRate: number,
    years: number
  ): number => {
    const monthlyRate = annualRate / 100 / 12
    const numPayments = years * 12

    if (monthlyRate === 0) return principal / numPayments

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

    return payment
  }

  const calculateROI = (property: PotentialProperty): ROICalculation => {
    const purchasePrice = Number(property.purchase_price)
    const isCashPurchase = property.is_cash_purchase
    const downPaymentPercent = Number(property.down_payment_percent)
    const interestRate = Number(property.interest_rate)
    const loanTermYears = Number(property.loan_term_years)
    const monthlyRent = Number(property.estimated_monthly_rent)
    const propertyTaxAnnual = Number(property.property_tax_annual)
    const insuranceAnnual = Number(property.insurance_annual)
    const hoaMonthly = Number(property.hoa_monthly)
    const propertyManagementPercent = Number(
      property.property_management_percent
    )
    const maintenanceMonthly = Number(property.maintenance_monthly)
    const otherExpensesMonthly = Number(property.other_expenses_monthly)

    // Calculate mortgage details
    const downPayment = isCashPurchase
      ? purchasePrice
      : purchasePrice * (downPaymentPercent / 100)
    const loanAmount = isCashPurchase ? 0 : purchasePrice - downPayment
    const monthlyMortgage = isCashPurchase
      ? 0
      : calculateMortgagePayment(loanAmount, interestRate, loanTermYears)

    // Calculate monthly expenses
    const monthlyPropertyTax = propertyTaxAnnual / 12
    const monthlyInsurance = insuranceAnnual / 12
    const propertyManagementFee =
      monthlyRent * (propertyManagementPercent / 100)

    const totalMonthlyExpenses =
      monthlyMortgage +
      monthlyPropertyTax +
      monthlyInsurance +
      hoaMonthly +
      propertyManagementFee +
      maintenanceMonthly +
      otherExpensesMonthly

    // Calculate cash flow and returns
    const monthlyCashFlow = monthlyRent - totalMonthlyExpenses
    const annualCashFlow = monthlyCashFlow * 12

    // Total investment - for cash purchases, no closing costs
    const closingCosts = isCashPurchase ? 0 : purchasePrice * 0.03
    const totalInvestment = downPayment + closingCosts

    // Cash on Cash Return
    const cashOnCashReturn = (annualCashFlow / totalInvestment) * 100

    // Cap Rate (without financing)
    const annualNetIncome =
      monthlyRent * 12 -
      (propertyTaxAnnual +
        insuranceAnnual +
        hoaMonthly * 12 +
        propertyManagementFee * 12 +
        maintenanceMonthly * 12 +
        otherExpensesMonthly * 12)
    const capRate = (annualNetIncome / purchasePrice) * 100

    // Determine rating - adjusted for cash purchases
    let rating: 'excellent' | 'good' | 'fair' | 'poor'
    let ratingColor: string

    if (isCashPurchase) {
      // For cash purchases, use cap rate as primary metric
      if (capRate >= 8 && monthlyCashFlow > 200) {
        rating = 'excellent'
        ratingColor = 'green'
      } else if (capRate >= 6 && monthlyCashFlow > 0) {
        rating = 'good'
        ratingColor = 'blue'
      } else if (capRate >= 4 || monthlyCashFlow > -100) {
        rating = 'fair'
        ratingColor = 'orange'
      } else {
        rating = 'poor'
        ratingColor = 'red'
      }
    } else {
      // For financed purchases, use CoC return
      if (cashOnCashReturn >= 10 && monthlyCashFlow > 200) {
        rating = 'excellent'
        ratingColor = 'green'
      } else if (cashOnCashReturn >= 6 && monthlyCashFlow > 0) {
        rating = 'good'
        ratingColor = 'blue'
      } else if (cashOnCashReturn >= 3 || monthlyCashFlow > -100) {
        rating = 'fair'
        ratingColor = 'orange'
      } else {
        rating = 'poor'
        ratingColor = 'red'
      }
    }

    return {
      monthlyMortgage,
      downPayment,
      loanAmount,
      monthlyPropertyTax,
      monthlyInsurance,
      totalMonthlyExpenses,
      propertyManagementFee,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCashReturn,
      capRate,
      totalInvestment,
      rating,
      ratingColor
    }
  }

  const saveProperty = async () => {
    if (!name || !purchasePrice || !estimatedRent) {
      toast({
        title: 'Please fill required fields',
        description: 'Name, Purchase Price, and Estimated Rent are required',
        status: 'warning',
        duration: 3000
      })
      return
    }

    try {
      const method = editingProperty ? 'PATCH' : 'POST'
      const payload = {
        ...(editingProperty && { id: editingProperty.id }),
        name,
        address,
        purchase_price: parseFloat(purchasePrice),
        is_cash_purchase: isCashPurchase,
        down_payment_percent: isCashPurchase
          ? 100
          : parseFloat(downPaymentPercent),
        interest_rate: isCashPurchase ? 0 : parseFloat(interestRate),
        loan_term_years: isCashPurchase ? 0 : parseInt(loanTermYears),
        estimated_monthly_rent: parseFloat(estimatedRent),
        property_tax_annual: parseFloat(propertyTaxAnnual) || 0,
        insurance_annual: parseFloat(insuranceAnnual) || 0,
        hoa_monthly: parseFloat(hoaMonthly) || 0,
        property_management_percent: parseFloat(propertyManagementPercent),
        maintenance_monthly: parseFloat(maintenanceMonthly) || 0,
        other_expenses_monthly: parseFloat(otherExpensesMonthly) || 0,
        notes,
        status
      }

      const res = await fetch('/api/potential-properties', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({
          title: editingProperty ? 'Property updated!' : 'Property added!',
          status: 'success',
          duration: 2000
        })
        clearForm()
        loadProperties()
      }
    } catch (error) {
      console.error('Error saving property:', error)
      toast({
        title: 'Error saving property',
        status: 'error',
        duration: 3000
      })
    }
  }

  const clearForm = () => {
    setName('')
    setAddress('')
    setPurchasePrice('')
    setIsCashPurchase(false)
    setDownPaymentPercent('20')
    setInterestRate('7')
    setLoanTermYears('30')
    setEstimatedRent('')
    setPropertyTaxAnnual('')
    setInsuranceAnnual('')
    setHoaMonthly('0')
    setPropertyManagementPercent('10')
    setMaintenanceMonthly('0')
    setOtherExpensesMonthly('0')
    setNotes('')
    setStatus('analyzing')
    setEditingProperty(null)
    setShowForm(false)
  }

  const startEditProperty = (property: PotentialProperty) => {
    setEditingProperty(property)
    setName(property.name)
    setAddress(property.address)
    setPurchasePrice(property.purchase_price.toString())
    setIsCashPurchase(property.is_cash_purchase || false)
    setDownPaymentPercent(property.down_payment_percent.toString())
    setInterestRate(property.interest_rate.toString())
    setLoanTermYears(property.loan_term_years.toString())
    setEstimatedRent(property.estimated_monthly_rent.toString())
    setPropertyTaxAnnual(property.property_tax_annual.toString())
    setInsuranceAnnual(property.insurance_annual.toString())
    setHoaMonthly(property.hoa_monthly.toString())
    setPropertyManagementPercent(
      property.property_management_percent.toString()
    )
    setMaintenanceMonthly(property.maintenance_monthly.toString())
    setOtherExpensesMonthly(property.other_expenses_monthly.toString())
    setNotes(property.notes)
    setStatus(property.status)
    setShowForm(true)
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('Delete this property analysis?')) return

    try {
      const res = await fetch(`/api/potential-properties?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast({
          title: 'Property deleted',
          status: 'success',
          duration: 2000
        })
        loadProperties()
      }
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return value.toFixed(2) + '%'
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <CheckCircle2 size={20} />
      case 'good':
        return <TrendingUp size={20} />
      case 'fair':
        return <AlertCircle size={20} />
      case 'poor':
        return <XCircle size={20} />
      default:
        return null
    }
  }

  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'Excellent Investment'
      case 'good':
        return 'Good Investment'
      case 'fair':
        return 'Fair / Below Market'
      case 'poor':
        return 'Poor Investment'
      default:
        return 'Unknown'
    }
  }

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Card
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            shadow="xl"
            borderRadius="2xl"
          >
            <CardBody py={4}>
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Box
                    bg="whiteAlpha.200"
                    p={2.5}
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                  >
                    <Calculator size={28} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" fontWeight="700" letterSpacing="tight">
                      ROI Analysis
                    </Heading>
                    <Text fontSize="xs" opacity={0.9} fontWeight="500">
                      Analyze potential property investments
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  leftIcon={<Plus size={18} />}
                  colorScheme="whiteAlpha"
                  bg="whiteAlpha.200"
                  _hover={{ bg: 'whiteAlpha.300' }}
                  size="sm"
                  onClick={() => {
                    clearForm()
                    setShowForm(!showForm)
                  }}
                >
                  Add Property
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Navigation Bar */}
          <Card shadow="sm" bg="white">
            <CardBody py={2}>
              <HStack spacing={1}>
                <Button
                  leftIcon={<ArrowLeft size={14} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => (window.location.href = '/')}
                  fontWeight="500"
                >
                  Monthly Dashboard
                </Button>
                <Button
                  leftIcon={<Calendar size={14} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => (window.location.href = '/yearly')}
                  fontWeight="500"
                >
                  Yearly View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  bg="purple.50"
                  _hover={{ bg: 'purple.100' }}
                  fontWeight="600"
                >
                  ROI Analysis
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Add/Edit Form */}
          {showForm && (
            <Card shadow="lg" borderWidth={2} borderColor="purple.200">
              <CardBody>
                <Heading size="md" mb={4}>
                  {editingProperty ? 'Edit' : 'Add'} Potential Property
                </Heading>

                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  {/* Basic Info */}
                  <GridItem colSpan={3}>
                    <Text fontWeight="bold" mb={2} color="purple.700">
                      Property Details
                    </Text>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Property Name</FormLabel>
                      <Input
                        bg="white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., 123 Main St Investment"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={2}>
                    <FormControl>
                      <FormLabel fontSize="sm">Address</FormLabel>
                      <Input
                        bg="white"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Full address"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">Purchase Price</FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder="250000"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm">
                        Estimated Monthly Rent
                      </FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={estimatedRent}
                        onChange={(e) => setEstimatedRent(e.target.value)}
                        placeholder="2000"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">Status</FormLabel>
                      <Select
                        bg="white"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="analyzing">Analyzing</option>
                        <option value="interested">Interested</option>
                        <option value="offer_made">Offer Made</option>
                        <option value="passed">Passed</option>
                        <option value="purchased">Purchased</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  {/* Financing */}
                  <GridItem colSpan={3}>
                    <Divider my={2} />
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold" color="purple.700">
                        Financing
                      </Text>
                      <Checkbox
                        colorScheme="purple"
                        isChecked={isCashPurchase}
                        onChange={(e) => setIsCashPurchase(e.target.checked)}
                      >
                        Cash Purchase (No Financing)
                      </Checkbox>
                    </HStack>
                  </GridItem>

                  {!isCashPurchase && (
                    <>
                      <GridItem>
                        <FormControl>
                          <FormLabel fontSize="sm">Down Payment %</FormLabel>
                          <Input
                            bg="white"
                            type="number"
                            value={downPaymentPercent}
                            onChange={(e) =>
                              setDownPaymentPercent(e.target.value)
                            }
                            placeholder="20"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontSize="sm">Interest Rate %</FormLabel>
                          <Input
                            bg="white"
                            type="number"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            placeholder="7.0"
                          />
                        </FormControl>
                      </GridItem>

                      <GridItem>
                        <FormControl>
                          <FormLabel fontSize="sm">Loan Term (years)</FormLabel>
                          <Select
                            bg="white"
                            value={loanTermYears}
                            onChange={(e) => setLoanTermYears(e.target.value)}
                          >
                            <option value="15">15 years</option>
                            <option value="30">30 years</option>
                          </Select>
                        </FormControl>
                      </GridItem>
                    </>
                  )}

                  {/* Expenses */}
                  <GridItem colSpan={3}>
                    <Divider my={2} />
                    <Text fontWeight="bold" mb={2} color="purple.700">
                      Monthly/Annual Expenses
                    </Text>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">Property Tax (Annual)</FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={propertyTaxAnnual}
                        onChange={(e) => setPropertyTaxAnnual(e.target.value)}
                        placeholder="3000"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">Insurance (Annual)</FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={insuranceAnnual}
                        onChange={(e) => setInsuranceAnnual(e.target.value)}
                        placeholder="1200"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">HOA (Monthly)</FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={hoaMonthly}
                        onChange={(e) => setHoaMonthly(e.target.value)}
                        placeholder="0"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">Property Management %</FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={propertyManagementPercent}
                        onChange={(e) =>
                          setPropertyManagementPercent(e.target.value)
                        }
                        placeholder="10"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">Maintenance (Monthly)</FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={maintenanceMonthly}
                        onChange={(e) => setMaintenanceMonthly(e.target.value)}
                        placeholder="100"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontSize="sm">
                        Other Expenses (Monthly)
                      </FormLabel>
                      <Input
                        bg="white"
                        type="number"
                        value={otherExpensesMonthly}
                        onChange={(e) =>
                          setOtherExpensesMonthly(e.target.value)
                        }
                        placeholder="0"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={3}>
                    <FormControl>
                      <FormLabel fontSize="sm">Notes</FormLabel>
                      <Textarea
                        bg="white"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes about this property..."
                        rows={3}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <HStack justify="end" mt={4}>
                  <Button size="sm" onClick={clearForm}>
                    Cancel
                  </Button>
                  <Button size="sm" colorScheme="purple" onClick={saveProperty}>
                    {editingProperty ? 'Update' : 'Add'} Property
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}

          {/* Properties List */}
          {properties.length > 0 ? (
            <Grid templateColumns="repeat(1, 1fr)" gap={6}>
              {properties.map((property) => {
                const roi = calculateROI(property)

                return (
                  <Card
                    key={property.id}
                    shadow="lg"
                    borderWidth={2}
                    borderColor={`${roi.ratingColor}.200`}
                  >
                    <CardBody>
                      <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                        {/* Left: Property Info */}
                        <GridItem colSpan={1}>
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="full">
                              <VStack align="start" spacing={0}>
                                <Heading size="md">{property.name}</Heading>
                                {property.address && (
                                  <Text fontSize="sm" color="gray.600">
                                    {property.address}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>

                            <Badge
                              colorScheme={roi.ratingColor}
                              fontSize="md"
                              px={3}
                              py={1}
                              borderRadius="md"
                            >
                              <HStack spacing={2}>
                                {getRatingIcon(roi.rating)}
                                <Text>{getRatingText(roi.rating)}</Text>
                              </HStack>
                            </Badge>

                            <VStack align="start" spacing={1} w="full">
                              <Text
                                fontSize="sm"
                                fontWeight="semibold"
                                color="gray.600"
                              >
                                Purchase Price
                              </Text>
                              <Text fontSize="xl" fontWeight="bold">
                                {formatCurrency(property.purchase_price)}
                              </Text>
                            </VStack>

                            {property.is_cash_purchase ? (
                              // For cash purchases: just show total investment = purchase price
                              <VStack align="start" spacing={1} w="full">
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color="gray.600"
                                >
                                  Total Investment
                                </Text>
                                <Badge colorScheme="green" fontSize="sm" mb={1}>
                                  Cash Purchase
                                </Badge>
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="purple.600"
                                >
                                  {formatCurrency(property.purchase_price)}
                                </Text>
                              </VStack>
                            ) : (
                              // For financed purchases: show down payment and total investment
                              <>
                                <VStack align="start" spacing={1} w="full">
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="gray.600"
                                  >
                                    Down Payment (
                                    {property.down_payment_percent}%)
                                  </Text>
                                  <Text
                                    fontSize="lg"
                                    fontWeight="bold"
                                    color="orange.600"
                                  >
                                    {formatCurrency(roi.downPayment)}
                                  </Text>
                                </VStack>

                                <VStack align="start" spacing={1} w="full">
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color="gray.600"
                                  >
                                    Total Investment
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    (Down + ~3% closing costs)
                                  </Text>
                                  <Text
                                    fontSize="lg"
                                    fontWeight="bold"
                                    color="red.600"
                                  >
                                    {formatCurrency(roi.totalInvestment)}
                                  </Text>
                                </VStack>
                              </>
                            )}

                            <HStack spacing={2} pt={2}>
                              <IconButton
                                aria-label="Edit"
                                icon={<Edit size={16} />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => startEditProperty(property)}
                              />
                              <IconButton
                                aria-label="Delete"
                                icon={<Trash2 size={16} />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => deleteProperty(property.id!)}
                              />
                            </HStack>
                          </VStack>
                        </GridItem>

                        {/* Middle: Monthly Breakdown */}
                        <GridItem colSpan={2}>
                          <VStack align="stretch" spacing={3}>
                            <Text fontWeight="bold" color="gray.700">
                              Monthly Breakdown
                            </Text>

                            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                              <Card bg="green.50">
                                <CardBody p={3}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" color="gray.600">
                                      Rental Income
                                    </Text>
                                    <Text
                                      fontSize="lg"
                                      fontWeight="bold"
                                      color="green.600"
                                    >
                                      {formatCurrency(
                                        property.estimated_monthly_rent
                                      )}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {!property.is_cash_purchase && (
                                <Card bg="red.50">
                                  <CardBody p={3}>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="xs" color="gray.600">
                                        Mortgage (P&I)
                                      </Text>
                                      <Text
                                        fontSize="lg"
                                        fontWeight="bold"
                                        color="red.600"
                                      >
                                        -{formatCurrency(roi.monthlyMortgage)}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              )}

                              <Card bg="orange.50">
                                <CardBody p={3}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" color="gray.600">
                                      Property Tax
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="bold"
                                      color="orange.600"
                                    >
                                      -{formatCurrency(roi.monthlyPropertyTax)}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>

                              <Card bg="orange.50">
                                <CardBody p={3}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" color="gray.600">
                                      Insurance
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="bold"
                                      color="orange.600"
                                    >
                                      -{formatCurrency(roi.monthlyInsurance)}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>

                              <Card bg="orange.50">
                                <CardBody p={3}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" color="gray.600">
                                      HOA
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="bold"
                                      color="orange.600"
                                    >
                                      -{formatCurrency(property.hoa_monthly)}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>

                              <Card bg="orange.50">
                                <CardBody p={3}>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="xs" color="gray.600">
                                      Property Mgmt (
                                      {property.property_management_percent}%)
                                    </Text>
                                    <Text
                                      fontSize="md"
                                      fontWeight="bold"
                                      color="orange.600"
                                    >
                                      -
                                      {formatCurrency(
                                        roi.propertyManagementFee
                                      )}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>

                              {property.maintenance_monthly > 0 && (
                                <Card bg="orange.50">
                                  <CardBody p={3}>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="xs" color="gray.600">
                                        Maintenance
                                      </Text>
                                      <Text
                                        fontSize="md"
                                        fontWeight="bold"
                                        color="orange.600"
                                      >
                                        -
                                        {formatCurrency(
                                          property.maintenance_monthly
                                        )}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              )}

                              {property.other_expenses_monthly > 0 && (
                                <Card bg="orange.50">
                                  <CardBody p={3}>
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="xs" color="gray.600">
                                        Other Expenses
                                      </Text>
                                      <Text
                                        fontSize="md"
                                        fontWeight="bold"
                                        color="orange.600"
                                      >
                                        -
                                        {formatCurrency(
                                          property.other_expenses_monthly
                                        )}
                                      </Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              )}
                            </Grid>

                            <Divider />

                            <Card bg="gray.100" borderWidth={2}>
                              <CardBody p={3}>
                                <HStack justify="space-between">
                                  <Text fontSize="sm" fontWeight="bold">
                                    Total Monthly Expenses
                                  </Text>
                                  <Text
                                    fontSize="lg"
                                    fontWeight="bold"
                                    color="red.600"
                                  >
                                    -{formatCurrency(roi.totalMonthlyExpenses)}
                                  </Text>
                                </HStack>
                              </CardBody>
                            </Card>
                          </VStack>
                        </GridItem>

                        {/* Right: ROI Metrics */}
                        <GridItem colSpan={1}>
                          <VStack align="stretch" spacing={4}>
                            <Text fontWeight="bold" color="gray.700">
                              ROI Metrics
                            </Text>

                            <Card
                              bg={
                                roi.monthlyCashFlow > 0
                                  ? 'green.50'
                                  : roi.monthlyCashFlow > -100
                                  ? 'orange.50'
                                  : 'red.50'
                              }
                              borderWidth={2}
                              borderColor={
                                roi.monthlyCashFlow > 0
                                  ? 'green.300'
                                  : roi.monthlyCashFlow > -100
                                  ? 'orange.300'
                                  : 'red.300'
                              }
                            >
                              <CardBody p={4}>
                                <VStack align="start" spacing={1}>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color="gray.600"
                                  >
                                    Monthly Cash Flow
                                  </Text>
                                  <Text
                                    fontSize="2xl"
                                    fontWeight="bold"
                                    color={
                                      roi.monthlyCashFlow > 0
                                        ? 'green.700'
                                        : roi.monthlyCashFlow > -100
                                        ? 'orange.700'
                                        : 'red.700'
                                    }
                                  >
                                    {roi.monthlyCashFlow >= 0 ? '+' : ''}
                                    {formatCurrency(roi.monthlyCashFlow)}
                                  </Text>
                                </VStack>
                              </CardBody>
                            </Card>

                            <Stat>
                              <StatLabel fontSize="xs">
                                Annual Cash Flow
                              </StatLabel>
                              <StatNumber
                                fontSize="xl"
                                color={
                                  roi.annualCashFlow > 0
                                    ? 'green.600'
                                    : 'red.600'
                                }
                              >
                                {roi.annualCashFlow >= 0 ? '+' : ''}
                                {formatCurrency(roi.annualCashFlow)}
                              </StatNumber>
                            </Stat>

                            <Divider />

                            <Stat>
                              <StatLabel fontSize="xs">
                                Cash-on-Cash Return
                              </StatLabel>
                              <StatNumber fontSize="2xl" color="purple.600">
                                {formatPercent(roi.cashOnCashReturn)}
                              </StatNumber>
                              <StatHelpText fontSize="xs">
                                {roi.cashOnCashReturn >= 10
                                  ? 'Excellent'
                                  : roi.cashOnCashReturn >= 6
                                  ? 'Good'
                                  : roi.cashOnCashReturn >= 3
                                  ? 'Fair'
                                  : 'Below Target'}
                              </StatHelpText>
                            </Stat>

                            <Stat>
                              <StatLabel fontSize="xs">Cap Rate</StatLabel>
                              <StatNumber fontSize="xl" color="blue.600">
                                {formatPercent(roi.capRate)}
                              </StatNumber>
                              <StatHelpText fontSize="xs">
                                (without financing)
                              </StatHelpText>
                            </Stat>

                            {property.notes && (
                              <>
                                <Divider />
                                <Box>
                                  <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color="gray.600"
                                    mb={1}
                                  >
                                    Notes
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {property.notes}
                                  </Text>
                                </Box>
                              </>
                            )}
                          </VStack>
                        </GridItem>
                      </Grid>
                    </CardBody>
                  </Card>
                )
              })}
            </Grid>
          ) : (
            <Card shadow="lg">
              <CardBody>
                <Box textAlign="center" py={12} color="gray.500">
                  <BarChart3
                    size={64}
                    style={{ margin: '0 auto', opacity: 0.3 }}
                  />
                  <Text mt={4} fontSize="lg">
                    No properties to analyze yet
                  </Text>
                  <Text fontSize="sm" mt={2}>
                    Click "Add Property" to start analyzing potential
                    investments
                  </Text>
                </Box>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
