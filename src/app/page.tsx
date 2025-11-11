// src/app/page.tsx - Complete Monthly Payment Tracker with Database
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
  Divider,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Checkbox,
  Textarea,
  Select,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import {
  Home,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Building2,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Circle
} from 'lucide-react'

interface Property {
  id: number
  name: string
  address: string
  monthly_rent: number
  property_management_percent: number
  hoa_fee: number
  is_paid_off: boolean
  notes: string
}

interface RecurringBill {
  id: number
  property_id: number | null
  property_name?: string
  name: string
  amount: number
  frequency: string
  due_month: number | null
  category: string
  payment_link: string
  notes: string
}

interface PaymentTracking {
  id?: number
  bill_type: string
  bill_id: number
  property_id: number | null
  payment_month: number
  payment_year: number
  is_paid: boolean
  paid_date: string | null
  amount_paid: number | null
  notes: string
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([])
  const [paymentTracking, setPaymentTracking] = useState<PaymentTracking[]>([])

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1) // 1-12
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [showBillForm, setShowBillForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null)

  const toast = useToast()

  // Property form
  const [propName, setPropName] = useState('')
  const [propAddress, setPropAddress] = useState('')
  const [propRent, setPropRent] = useState('')
  const [propMgmtPercent, setPropMgmtPercent] = useState('10')
  const [propHoa, setPropHoa] = useState('0')
  const [propPaidOff, setPropPaidOff] = useState(false)

  // Bill form
  const [billPropertyId, setBillPropertyId] = useState<string>('')
  const [billName, setBillName] = useState('')
  const [billAmount, setBillAmount] = useState('')
  const [billFrequency, setBillFrequency] = useState('monthly')
  const [billDueMonth, setBillDueMonth] = useState('')
  const [billCategory, setBillCategory] = useState('other')
  const [billPaymentLink, setBillPaymentLink] = useState('')
  const [billNotes, setBillNotes] = useState('')

  // Load data
  useEffect(() => {
    loadProperties()
    loadRecurringBills()
    loadPaymentTracking()
  }, [currentMonth, currentYear])

  const loadProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(data)
    } catch (error) {
      console.error('Error loading properties:', error)
      toast({
        title: 'Error loading properties',
        status: 'error',
        duration: 3000
      })
    }
  }

  const loadRecurringBills = async () => {
    try {
      const res = await fetch('/api/recurring-bills')
      const data = await res.json()
      setRecurringBills(data)
    } catch (error) {
      console.error('Error loading bills:', error)
    }
  }

  const loadPaymentTracking = async () => {
    try {
      const res = await fetch(
        `/api/payment-tracking?month=${currentMonth}&year=${currentYear}`
      )
      const data = await res.json()
      setPaymentTracking(data)
    } catch (error) {
      console.error('Error loading payment tracking:', error)
    }
  }

  const addProperty = async () => {
    if (!propName || !propRent) {
      toast({
        title: 'Please fill required fields',
        status: 'warning',
        duration: 2000
      })
      return
    }

    try {
      const method = editingProperty ? 'PATCH' : 'POST'
      const payload = {
        ...(editingProperty && { id: editingProperty.id }),
        name: propName,
        address: propAddress,
        monthly_rent: parseFloat(propRent),
        property_management_percent: parseFloat(propMgmtPercent),
        hoa_fee: parseFloat(propHoa),
        is_paid_off: propPaidOff
      }

      const res = await fetch('/api/properties', {
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
        setPropName('')
        setPropAddress('')
        setPropRent('')
        setPropMgmtPercent('10')
        setPropHoa('0')
        setPropPaidOff(false)
        setEditingProperty(null)
        setShowPropertyForm(false)
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

  const startEditProperty = (property: Property) => {
    setEditingProperty(property)
    setPropName(property.name)
    setPropAddress(property.address)
    setPropRent(property.monthly_rent.toString())
    setPropMgmtPercent(property.property_management_percent.toString())
    setPropHoa(property.hoa_fee.toString())
    setPropPaidOff(property.is_paid_off)
    setShowPropertyForm(true)
  }

  const cancelPropertyEdit = () => {
    setEditingProperty(null)
    setPropName('')
    setPropAddress('')
    setPropRent('')
    setPropMgmtPercent('10')
    setPropHoa('0')
    setPropPaidOff(false)
    setShowPropertyForm(false)
  }

  const deleteProperty = async (id: number) => {
    if (!confirm('Delete this property?')) return

    try {
      const res = await fetch(`/api/properties?id=${id}`, {
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

  const addRecurringBill = async () => {
    if (!billName || !billAmount) {
      toast({
        title: 'Please fill required fields',
        status: 'warning',
        duration: 2000
      })
      return
    }

    try {
      const method = editingBill ? 'PATCH' : 'POST'
      const payload = {
        ...(editingBill && { id: editingBill.id }),
        property_id: billPropertyId ? parseInt(billPropertyId) : null,
        name: billName,
        amount: parseFloat(billAmount),
        frequency: billFrequency,
        due_month: billDueMonth ? parseInt(billDueMonth) : null,
        category: billCategory,
        payment_link: billPaymentLink,
        notes: billNotes,
        is_active: true
      }

      console.log('Sending bill payload:', payload)

      const res = await fetch('/api/recurring-bills', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      console.log('Response:', data)

      if (res.ok) {
        toast({
          title: editingBill ? 'Bill updated!' : 'Bill added!',
          status: 'success',
          duration: 2000
        })
        // Clear form
        setBillPropertyId('')
        setBillName('')
        setBillAmount('')
        setBillFrequency('monthly')
        setBillDueMonth('')
        setBillCategory('other')
        setBillPaymentLink('')
        setBillNotes('')
        setEditingBill(null)
        setShowBillForm(false)
        // Refresh bills
        await loadRecurringBills()
      } else {
        toast({
          title: 'Error saving bill',
          description: data.error || 'Unknown error',
          status: 'error',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error saving bill:', error)
      toast({
        title: 'Error saving bill',
        description: String(error),
        status: 'error',
        duration: 3000
      })
    }
  }

  const startEditBill = (bill: RecurringBill) => {
    setEditingBill(bill)
    setBillPropertyId(bill.property_id?.toString() || '')
    setBillName(bill.name)
    setBillAmount(bill.amount.toString())
    setBillFrequency(bill.frequency)
    setBillDueMonth(bill.due_month?.toString() || '')
    setBillCategory(bill.category)
    setBillPaymentLink(bill.payment_link)
    setBillNotes(bill.notes)
    setShowBillForm(true)
  }

  const cancelBillEdit = () => {
    setEditingBill(null)
    setBillPropertyId('')
    setBillName('')
    setBillAmount('')
    setBillFrequency('monthly')
    setBillDueMonth('')
    setBillCategory('other')
    setBillPaymentLink('')
    setBillNotes('')
    setShowBillForm(false)
  }

  const deleteRecurringBill = async (id: number) => {
    if (!confirm('Delete this bill?')) return

    try {
      const res = await fetch(`/api/recurring-bills?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast({
          title: 'Bill deleted',
          status: 'success',
          duration: 2000
        })
        loadRecurringBills()
      }
    } catch (error) {
      console.error('Error deleting bill:', error)
    }
  }

  const togglePayment = async (bill: RecurringBill, billType: string) => {
    // Check if already tracked
    const existing = paymentTracking.find(
      (pt) => pt.bill_type === billType && pt.bill_id === bill.id
    )

    const isPaid = existing ? !existing.is_paid : true

    try {
      const res = await fetch('/api/payment-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_type: billType,
          bill_id: bill.id,
          property_id: bill.property_id,
          payment_month: currentMonth,
          payment_year: currentYear,
          is_paid: isPaid,
          paid_date: isPaid ? new Date().toISOString().split('T')[0] : null,
          amount_paid: isPaid ? bill.amount : null,
          notes: ''
        })
      })

      if (res.ok) {
        loadPaymentTracking()
      }
    } catch (error) {
      console.error('Error toggling payment:', error)
    }
  }

  const isPaymentTracked = (billId: number, billType: string) => {
    const tracked = paymentTracking.find(
      (pt) => pt.bill_type === billType && pt.bill_id === billId
    )
    return tracked?.is_paid || false
  }

  const isMonthFullyPaid = () => {
    const billsThisMonth = getBillsForMonth()
    if (billsThisMonth.length === 0) return false

    return billsThisMonth.every((bill) =>
      isPaymentTracked(bill.id, 'recurring_bill')
    )
  }

  const markAllAsPaid = async () => {
    const billsThisMonth = getBillsForMonth()

    if (billsThisMonth.length === 0) {
      toast({
        title: 'No bills this month',
        status: 'info',
        duration: 2000
      })
      return
    }

    try {
      // Mark all bills as paid
      for (const bill of billsThisMonth) {
        await fetch('/api/payment-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bill_type: 'recurring_bill',
            bill_id: bill.id,
            property_id: bill.property_id,
            payment_month: currentMonth,
            payment_year: currentYear,
            is_paid: true,
            paid_date: new Date().toISOString().split('T')[0],
            amount_paid: bill.amount,
            notes: 'Marked as paid in bulk'
          })
        })
      }

      toast({
        title: `All ${billsThisMonth.length} bills marked as paid!`,
        status: 'success',
        duration: 3000
      })

      loadPaymentTracking()
    } catch (error) {
      console.error('Error marking all as paid:', error)
      toast({
        title: 'Error marking bills as paid',
        status: 'error',
        duration: 3000
      })
    }
  }

  const markAllAsUnpaid = async () => {
    const billsThisMonth = getBillsForMonth()

    try {
      for (const bill of billsThisMonth) {
        await fetch('/api/payment-tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bill_type: 'recurring_bill',
            bill_id: bill.id,
            property_id: bill.property_id,
            payment_month: currentMonth,
            payment_year: currentYear,
            is_paid: false,
            paid_date: null,
            amount_paid: null,
            notes: ''
          })
        })
      }

      toast({
        title: 'All bills marked as unpaid',
        status: 'success',
        duration: 2000
      })

      loadPaymentTracking()
    } catch (error) {
      console.error('Error marking all as unpaid:', error)
    }
  }

  const changeMonth = (direction: number) => {
    let newMonth = currentMonth + direction
    let newYear = currentYear

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)
  }

  const getBillsForMonth = () => {
    return recurringBills.filter((bill) => {
      // Monthly bills - show every month
      if (bill.frequency === 'monthly') return true

      // Annual bills - only show in the due month
      if (bill.frequency === 'annual' && bill.due_month === currentMonth)
        return true

      // Quarterly bills - show in Jan (1), Apr (4), Jul (7), Oct (10)
      if (bill.frequency === 'quarterly') {
        const quarterlyMonths = [1, 4, 7, 10]
        return quarterlyMonths.includes(currentMonth)
      }

      // Semi-annual bills - show in Jan (1) and Jul (7)
      if (bill.frequency === 'semi-annual') {
        const semiAnnualMonths = [1, 7]
        return semiAnnualMonths.includes(currentMonth)
      }

      return false
    })
  }

  const calculateMonthlyTotals = () => {
    const billsThisMonth = getBillsForMonth()

    const totalIncome = properties.reduce(
      (sum, p) => sum + Number(p.monthly_rent),
      0
    )
    const totalManagement = properties.reduce(
      (sum, p) =>
        sum +
        (Number(p.monthly_rent) * Number(p.property_management_percent)) / 100,
      0
    )
    // HOA is now tracked as a bill, not here
    const totalBills = billsThisMonth.reduce(
      (sum, b) => sum + Number(b.amount),
      0
    )

    const netIncome = totalIncome - totalManagement - totalBills

    return {
      totalIncome,
      totalManagement,
      totalBills,
      netIncome
    }
  }

  const totals = calculateMonthlyTotals()
  const billsThisMonth = getBillsForMonth()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header with Month Selector */}
          <Card bg="blue.600" color="white" shadow="xl" borderRadius="xl">
            <CardBody py={8}>
              <Grid templateColumns="1fr auto 1fr" gap={8} alignItems="center">
                {/* Left: Title */}
                <VStack align="start" spacing={2}>
                  <Heading size="2xl" fontWeight="bold">
                    Rental Property Manager
                  </Heading>
                  <Text fontSize="md" opacity={0.9}>
                    Monthly payment tracking & cash flow
                  </Text>
                </VStack>

                {/* Center: Month Navigator */}
                <VStack spacing={3}>
                  <HStack
                    spacing={4}
                    bg="whiteAlpha.200"
                    px={6}
                    py={3}
                    borderRadius="xl"
                    backdropFilter="blur(10px)"
                  >
                    <IconButton
                      aria-label="Previous month"
                      icon={<ChevronLeft size={20} />}
                      onClick={() => changeMonth(-1)}
                      size="md"
                      colorScheme="whiteAlpha"
                      variant="ghost"
                      _hover={{ bg: 'whiteAlpha.300' }}
                      borderRadius="lg"
                    />
                    <VStack spacing={0} minW="220px" textAlign="center">
                      <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        letterSpacing="tight"
                      >
                        {MONTHS[currentMonth - 1]}
                      </Text>
                      <Text fontSize="lg" opacity={0.9} fontWeight="medium">
                        {currentYear}
                      </Text>
                    </VStack>
                    <IconButton
                      aria-label="Next month"
                      icon={<ChevronRight size={20} />}
                      onClick={() => changeMonth(1)}
                      size="md"
                      colorScheme="whiteAlpha"
                      variant="ghost"
                      _hover={{ bg: 'whiteAlpha.300' }}
                      borderRadius="lg"
                    />
                  </HStack>
                  <Text fontSize="xs" opacity={0.7} fontStyle="italic">
                    Click arrows to change month
                  </Text>
                </VStack>

                {/* Right: Net Cash Flow */}
                <Card
                  bg={totals.netIncome >= 0 ? 'green.500' : 'red.500'}
                  color="white"
                  shadow="lg"
                  borderRadius="xl"
                >
                  <CardBody py={4}>
                    <VStack spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        opacity={0.9}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Net Cash Flow
                      </Text>
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        letterSpacing="tight"
                      >
                        {formatCurrency(totals.netIncome)}
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {totals.netIncome >= 0 ? '↑ Positive' : '↓ Negative'}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </CardBody>
          </Card>

          {/* Monthly Summary */}
          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <GridItem>
              <Card shadow="md">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Rental Income
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {formatCurrency(totals.totalIncome)}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Property Management
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      -{formatCurrency(totals.totalManagement)}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Bills This Month
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.500">
                      -{formatCurrency(totals.totalBills)}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Paid This Month
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                      {paymentTracking.filter((pt) => pt.is_paid).length} /{' '}
                      {billsThisMonth.length}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Monthly Payment Checklist */}
          <Card shadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack spacing={4}>
                    <Calendar size={24} />
                    <VStack align="start" spacing={0}>
                      <Heading size="md">
                        {MONTHS[currentMonth - 1]} Payment Checklist
                      </Heading>
                      {isMonthFullyPaid() && (
                        <Badge colorScheme="green" fontSize="sm">
                          ✓ All Bills Paid
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                  <HStack spacing={2}>
                    {billsThisMonth.length > 0 && (
                      <>
                        {isMonthFullyPaid() ? (
                          <Button
                            leftIcon={<Circle size={18} />}
                            colorScheme="gray"
                            size="sm"
                            variant="outline"
                            onClick={markAllAsUnpaid}
                          >
                            Mark All Unpaid
                          </Button>
                        ) : (
                          <Button
                            leftIcon={<CheckCircle2 size={18} />}
                            colorScheme="green"
                            size="sm"
                            onClick={markAllAsPaid}
                          >
                            Mark All as Paid
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      leftIcon={<Plus size={18} />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => {
                        setEditingBill(null)
                        setShowBillForm(!showBillForm)
                      }}
                    >
                      Add Bill
                    </Button>
                  </HStack>
                </HStack>

                {showBillForm && (
                  <Card bg="blue.50" borderWidth={1} borderColor="blue.200">
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        {editingBill ? 'Edit Bill' : 'Add New Bill'}
                      </Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Bill Name *</FormLabel>
                            <Input
                              bg="white"
                              value={billName}
                              onChange={(e) => setBillName(e.target.value)}
                              placeholder="e.g., Property Tax - 123 Main St"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Amount *</FormLabel>
                            <Input
                              bg="white"
                              type="number"
                              value={billAmount}
                              onChange={(e) => setBillAmount(e.target.value)}
                              placeholder="0.00"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Property</FormLabel>
                            <Select
                              bg="white"
                              value={billPropertyId}
                              onChange={(e) =>
                                setBillPropertyId(e.target.value)
                              }
                            >
                              <option value="">General / All Properties</option>
                              {properties.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Frequency</FormLabel>
                            <Select
                              bg="white"
                              value={billFrequency}
                              onChange={(e) => setBillFrequency(e.target.value)}
                            >
                              <option value="monthly">Monthly</option>
                              <option value="annual">Annual</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="semi-annual">Semi-Annual</option>
                            </Select>
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">
                              Due Month (for annual)
                            </FormLabel>
                            <Select
                              bg="white"
                              value={billDueMonth}
                              onChange={(e) => setBillDueMonth(e.target.value)}
                            >
                              <option value="">N/A</option>
                              {MONTHS.map((month, idx) => (
                                <option key={idx} value={idx + 1}>
                                  {month}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Category</FormLabel>
                            <Select
                              bg="white"
                              value={billCategory}
                              onChange={(e) => setBillCategory(e.target.value)}
                            >
                              <option value="taxes">Property Tax</option>
                              <option value="insurance">Insurance</option>
                              <option value="hoa">HOA</option>
                              <option value="utilities">Utilities</option>
                              <option value="lawn_care">Lawn Care</option>
                              <option value="pool">Pool Maintenance</option>
                              <option value="maintenance">Maintenance</option>
                              <option value="other">Other</option>
                            </Select>
                          </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                          <FormControl>
                            <FormLabel fontSize="sm">Payment Link</FormLabel>
                            <Input
                              bg="white"
                              value={billPaymentLink}
                              onChange={(e) =>
                                setBillPaymentLink(e.target.value)
                              }
                              placeholder="https://..."
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                          <FormControl>
                            <FormLabel fontSize="sm">Notes</FormLabel>
                            <Textarea
                              bg="white"
                              value={billNotes}
                              onChange={(e) => setBillNotes(e.target.value)}
                              placeholder="Any additional notes..."
                              rows={2}
                            />
                          </FormControl>
                        </GridItem>
                      </Grid>
                      <HStack justify="end" mt={4}>
                        <Button size="sm" onClick={cancelBillEdit}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={addRecurringBill}
                        >
                          {editingBill ? 'Update Bill' : 'Add Bill'}
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {billsThisMonth.length > 0 ? (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Paid</Th>
                        <Th>Bill</Th>
                        <Th>Property</Th>
                        <Th>Category</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Link</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {billsThisMonth.map((bill) => {
                        const isPaid = isPaymentTracked(
                          bill.id,
                          'recurring_bill'
                        )

                        return (
                          <Tr key={bill.id} bg={isPaid ? 'green.50' : 'white'}>
                            <Td>
                              <Checkbox
                                isChecked={isPaid}
                                onChange={() =>
                                  togglePayment(bill, 'recurring_bill')
                                }
                                colorScheme="green"
                                size="lg"
                              />
                            </Td>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold">{bill.name}</Text>
                                {bill.notes && (
                                  <Text fontSize="xs" color="gray.500">
                                    {bill.notes}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.600">
                                {bill.property_name || 'General'}
                              </Text>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple" fontSize="xs">
                                {bill.category}
                              </Badge>
                            </Td>
                            <Td isNumeric fontWeight="bold" color="red.600">
                              {formatCurrency(bill.amount)}
                            </Td>
                            <Td>
                              {bill.payment_link && (
                                <Link href={bill.payment_link} isExternal>
                                  <IconButton
                                    aria-label="Payment link"
                                    icon={<ExternalLink size={16} />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="blue"
                                  />
                                </Link>
                              )}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="Edit bill"
                                  icon={<Edit size={16} />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => startEditBill(bill)}
                                />
                                <IconButton
                                  aria-label="Delete bill"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => deleteRecurringBill(bill.id)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center" py={8} color="gray.500">
                    <Calendar
                      size={48}
                      style={{ margin: '0 auto', opacity: 0.3 }}
                    />
                    <Text mt={2}>No bills for {MONTHS[currentMonth - 1]}</Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Properties Section */}
          <Card shadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack>
                    <Building2 size={24} />
                    <Heading size="md">Your Properties</Heading>
                  </HStack>
                  <Button
                    leftIcon={<Plus size={18} />}
                    colorScheme="green"
                    size="sm"
                    onClick={() => {
                      setEditingProperty(null)
                      setPropName('')
                      setPropAddress('')
                      setPropRent('')
                      setPropMgmtPercent('10')
                      setPropHoa('0')
                      setPropPaidOff(false)
                      setShowPropertyForm(!showPropertyForm)
                    }}
                  >
                    Add Property
                  </Button>
                </HStack>

                {showPropertyForm && (
                  <Card bg="green.50" borderWidth={1} borderColor="green.200">
                    <CardBody>
                      <Heading size="sm" mb={4}>
                        {editingProperty ? 'Edit Property' : 'Add New Property'}
                      </Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Property Name *</FormLabel>
                            <Input
                              bg="white"
                              value={propName}
                              onChange={(e) => setPropName(e.target.value)}
                              placeholder="e.g., 123 Main St"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Monthly Rent *</FormLabel>
                            <Input
                              bg="white"
                              type="number"
                              value={propRent}
                              onChange={(e) => setPropRent(e.target.value)}
                              placeholder="0.00"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem colSpan={2}>
                          <FormControl>
                            <FormLabel fontSize="sm">Address</FormLabel>
                            <Input
                              bg="white"
                              value={propAddress}
                              onChange={(e) => setPropAddress(e.target.value)}
                              placeholder="Full address"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">Management %</FormLabel>
                            <Input
                              bg="white"
                              type="number"
                              value={propMgmtPercent}
                              onChange={(e) =>
                                setPropMgmtPercent(e.target.value)
                              }
                              placeholder="10"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl>
                            <FormLabel fontSize="sm">HOA (monthly)</FormLabel>
                            <Input
                              bg="white"
                              type="number"
                              value={propHoa}
                              onChange={(e) => setPropHoa(e.target.value)}
                              placeholder="0.00"
                            />
                          </FormControl>
                        </GridItem>
                        <GridItem>
                          <FormControl
                            display="flex"
                            alignItems="center"
                            mt={6}
                          >
                            <Checkbox
                              isChecked={propPaidOff}
                              onChange={(e) => setPropPaidOff(e.target.checked)}
                            >
                              Property is paid off
                            </Checkbox>
                          </FormControl>
                        </GridItem>
                      </Grid>
                      <HStack justify="end" mt={4}>
                        <Button size="sm" onClick={cancelPropertyEdit}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={addProperty}
                        >
                          {editingProperty ? 'Update Property' : 'Add Property'}
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {properties.length > 0 ? (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Property</Th>
                        <Th isNumeric>Monthly Rent</Th>
                        <Th isNumeric>Management</Th>
                        <Th isNumeric>HOA</Th>
                        <Th isNumeric>Net</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {properties.map((prop) => {
                        const management =
                          Number(prop.monthly_rent) *
                          (Number(prop.property_management_percent) / 100)
                        const net =
                          Number(prop.monthly_rent) -
                          management -
                          Number(prop.hoa_fee)

                        return (
                          <Tr key={prop.id}>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <HStack>
                                  <Text fontWeight="semibold">{prop.name}</Text>
                                  {prop.is_paid_off && (
                                    <Badge colorScheme="green" fontSize="xs">
                                      Paid Off
                                    </Badge>
                                  )}
                                </HStack>
                                {prop.address && (
                                  <Text fontSize="xs" color="gray.500">
                                    {prop.address}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td
                              isNumeric
                              fontWeight="semibold"
                              color="green.600"
                            >
                              {formatCurrency(Number(prop.monthly_rent))}
                            </Td>
                            <Td isNumeric color="orange.600">
                              {formatCurrency(management)}
                            </Td>
                            <Td isNumeric color="orange.600">
                              {formatCurrency(Number(prop.hoa_fee))}
                            </Td>
                            <Td isNumeric fontWeight="bold" color="blue.600">
                              {formatCurrency(net)}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="Edit property"
                                  icon={<Edit size={16} />}
                                  size="sm"
                                  colorScheme="blue"
                                  variant="ghost"
                                  onClick={() => startEditProperty(prop)}
                                />
                                <IconButton
                                  aria-label="Delete"
                                  icon={<Trash2 size={16} />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => deleteProperty(prop.id)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center" py={8} color="gray.500">
                    <Building2
                      size={48}
                      style={{ margin: '0 auto', opacity: 0.3 }}
                    />
                    <Text mt={2}>No properties yet</Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
