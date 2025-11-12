// src/app/yearly/page.tsx - Yearly Cash Flow View
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Select,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building2,
  Home
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Property {
  id: number
  name: string
  monthly_rent: number
  property_management_percent: number
  extra_monthly_expenses: number
  hoa_fee: number
  is_rental: boolean
  purchase_price: number
  is_paid_off: boolean
}

interface RecurringBill {
  id: number
  property_id: number | null
  name: string
  amount: number
  frequency: string
  due_month: number | null
  category: string
  is_one_time: boolean
  one_time_year: number | null
  escrow_amount: number
}

interface MonthlyData {
  month: number
  monthName: string
  income: number
  management: number
  bills: number
  netCashFlow: number
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

export default function YearlyView() {
  const router = useRouter()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [properties, setProperties] = useState<Property[]>([])
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [currentYear])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load properties
      const propsRes = await fetch('/api/properties')
      const propsData = await propsRes.json()
      setProperties(propsData)

      // Load recurring bills
      const billsRes = await fetch('/api/recurring-bills')
      const billsData = await billsRes.json()
      setRecurringBills(billsData)

      // Calculate monthly data for the year
      calculateYearlyData(propsData, billsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateYearlyData = (props: Property[], bills: RecurringBill[]) => {
    const yearData: MonthlyData[] = []

    // Calculate for each month
    for (let month = 1; month <= 12; month++) {
      // Income from all properties
      const income = props.reduce((sum, p) => sum + Number(p.monthly_rent), 0)

      // Management fees and extra expenses
      const management = props.reduce(
        (sum, p) =>
          sum +
          (Number(p.monthly_rent) * Number(p.property_management_percent)) /
            100 +
          Number(p.extra_monthly_expenses || 0),
        0
      )

      // Bills for this month (including escrow)
      const billsForMonth = getBillsForMonth(bills, month)
      const billsTotal = billsForMonth.reduce(
        (sum, b) => sum + Number(b.amount) + Number(b.escrow_amount || 0),
        0
      )

      yearData.push({
        month,
        monthName: MONTHS[month - 1],
        income,
        management,
        bills: billsTotal,
        netCashFlow: income - management - billsTotal
      })
    }

    setMonthlyData(yearData)
  }

  const getBillsForMonth = (bills: RecurringBill[], month: number) => {
    return bills.filter((bill) => {
      // One-time expenses - only show in the specific month and year
      if (bill.is_one_time && bill.due_month && bill.one_time_year) {
        return bill.due_month === month && bill.one_time_year === currentYear
      }

      // Monthly bills
      if (bill.frequency === 'monthly') return true

      // Annual bills
      if (bill.frequency === 'annual' && bill.due_month === month) return true

      // Quarterly bills
      if (bill.frequency === 'quarterly') {
        const quarterlyMonths = [1, 4, 7, 10]
        return quarterlyMonths.includes(month)
      }

      // Semi-annual bills
      if (bill.frequency === 'semi-annual') {
        const semiAnnualMonths = [1, 7]
        return semiAnnualMonths.includes(month)
      }

      return false
    })
  }

  const calculateYearlyTotals = () => {
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
    const totalManagement = monthlyData.reduce(
      (sum, m) => sum + m.management,
      0
    )
    const totalBills = monthlyData.reduce((sum, m) => sum + m.bills, 0)
    const totalNet = monthlyData.reduce((sum, m) => sum + m.netCashFlow, 0)

    return {
      income: totalIncome,
      management: totalManagement,
      bills: totalBills,
      net: totalNet
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const changeYear = (direction: number) => {
    setCurrentYear(currentYear + direction)
  }

  const yearlyTotals = calculateYearlyTotals()
  const averageMonthly = yearlyTotals.net / 12

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
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top="-50%"
              right="-10%"
              width="400px"
              height="400px"
              borderRadius="full"
              bg="whiteAlpha.100"
              filter="blur(60px)"
            />
            <Box
              position="absolute"
              bottom="-30%"
              left="-5%"
              width="300px"
              height="300px"
              borderRadius="full"
              bg="whiteAlpha.100"
              filter="blur(50px)"
            />

            <CardBody py={4} position="relative" zIndex={1}>
              <HStack justify="space-between" align="center">
                {/* Left: Title */}
                <HStack spacing={3}>
                  <Box
                    bg="whiteAlpha.200"
                    p={2.5}
                    borderRadius="lg"
                    backdropFilter="blur(10px)"
                  >
                    <Calendar size={28} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="md" fontWeight="700" letterSpacing="tight">
                      Yearly Cash Flow
                    </Heading>
                    <Text fontSize="xs" opacity={0.9} fontWeight="500">
                      Annual performance overview
                    </Text>
                  </VStack>
                </HStack>

                {/* Center: Year Selector */}
                <HStack
                  spacing={3}
                  bg="whiteAlpha.200"
                  px={5}
                  py={2.5}
                  borderRadius="xl"
                  backdropFilter="blur(20px)"
                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <IconButton
                    aria-label="Previous year"
                    icon={<ChevronLeft size={18} />}
                    onClick={() => changeYear(-1)}
                    size="sm"
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    _hover={{ bg: 'whiteAlpha.300' }}
                    borderRadius="lg"
                  />
                  <Text
                    fontSize="xl"
                    fontWeight="700"
                    minW="80px"
                    textAlign="center"
                  >
                    {currentYear}
                  </Text>
                  <IconButton
                    aria-label="Next year"
                    icon={<ChevronRight size={18} />}
                    onClick={() => changeYear(1)}
                    size="sm"
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    _hover={{ bg: 'whiteAlpha.300' }}
                    borderRadius="lg"
                  />
                </HStack>

                {/* Right: Total Net */}
                <HStack
                  bg="whiteAlpha.200"
                  backdropFilter="blur(20px)"
                  px={5}
                  py={2.5}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={yearlyTotals.net >= 0 ? 'green.300' : 'red.300'}
                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                  spacing={3}
                >
                  <HStack spacing={2}>
                    <Box
                      as={DollarSign}
                      size={16}
                      bg={yearlyTotals.net >= 0 ? 'green.400' : 'red.400'}
                      borderRadius="md"
                      p={1}
                    />
                    <VStack spacing={0} align="start">
                      <Text
                        fontSize="xs"
                        fontWeight="700"
                        opacity={0.85}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Total Net
                      </Text>
                      <Text
                        fontSize="xl"
                        fontWeight="800"
                        letterSpacing="tight"
                        color={yearlyTotals.net >= 0 ? 'green.100' : 'red.100'}
                        lineHeight="1.2"
                      >
                        {formatCurrency(yearlyTotals.net)}
                      </Text>
                    </VStack>
                  </HStack>
                  <Badge
                    colorScheme={yearlyTotals.net >= 0 ? 'green' : 'red'}
                    fontSize="xs"
                    fontWeight="600"
                    px={2.5}
                    py={0.5}
                    borderRadius="md"
                    alignSelf="center"
                  >
                    {yearlyTotals.net >= 0 ? '↑ Positive' : '↓ Negative'}
                  </Badge>
                </HStack>
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
                  onClick={() => router.push('/')}
                  fontWeight="500"
                >
                  Monthly Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  bg="purple.50"
                  _hover={{ bg: 'purple.100' }}
                  fontWeight="600"
                >
                  Yearly View
                </Button>
                <Button
                  leftIcon={<TrendingUp size={14} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/roi')}
                  fontWeight="500"
                >
                  ROI Analysis
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* Yearly Summary Cards */}
          <Grid templateColumns="repeat(5, 1fr)" gap={4}>
            <GridItem>
              <Card shadow="md" h="full">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Total Income
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {formatCurrency(yearlyTotals.income)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatCurrency(yearlyTotals.income / 12)}/mo avg
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md" h="full">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Management
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      -{formatCurrency(yearlyTotals.management)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatCurrency(yearlyTotals.management / 12)}/mo avg
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md" h="full">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Total Bills
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.500">
                      -{formatCurrency(yearlyTotals.bills)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatCurrency(yearlyTotals.bills / 12)}/mo avg
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md" h="full">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Avg Monthly Net
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color={averageMonthly >= 0 ? 'blue.500' : 'red.500'}
                    >
                      {formatCurrency(averageMonthly)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      per month
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
            <GridItem>
              <Card shadow="md" h="full">
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Profit Margin
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color={
                        (yearlyTotals.net / yearlyTotals.income) * 100 >= 0
                          ? 'purple.500'
                          : 'red.500'
                      }
                    >
                      {yearlyTotals.income > 0
                        ? `${(
                            (yearlyTotals.net / yearlyTotals.income) *
                            100
                          ).toFixed(1)}%`
                        : 'N/A'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      of total income
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Monthly Breakdown Table */}
          <Card shadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Calendar size={24} />
                    <Heading size="md">Monthly Breakdown</Heading>
                  </HStack>
                </HStack>

                {isLoading ? (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">Loading data...</Text>
                  </Box>
                ) : (
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Month</Th>
                        <Th isNumeric>Income</Th>
                        <Th isNumeric>Management</Th>
                        <Th isNumeric>Bills</Th>
                        <Th isNumeric>Net Cash Flow</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {monthlyData.map((data) => (
                        <Tr
                          key={data.month}
                          bg={data.netCashFlow >= 0 ? 'green.50' : 'red.50'}
                          _hover={{
                            bg: data.netCashFlow >= 0 ? 'green.100' : 'red.100'
                          }}
                        >
                          <Td fontWeight="semibold">{data.monthName}</Td>
                          <Td isNumeric color="green.600" fontWeight="medium">
                            {formatCurrency(data.income)}
                          </Td>
                          <Td isNumeric color="orange.600">
                            -{formatCurrency(data.management)}
                          </Td>
                          <Td isNumeric color="red.600">
                            -{formatCurrency(data.bills)}
                          </Td>
                          <Td
                            isNumeric
                            fontWeight="bold"
                            fontSize="md"
                            color={
                              data.netCashFlow >= 0 ? 'green.700' : 'red.700'
                            }
                          >
                            {formatCurrency(data.netCashFlow)}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                data.netCashFlow >= 0 ? 'green' : 'red'
                              }
                              fontSize="xs"
                            >
                              {data.netCashFlow >= 0 ? (
                                <HStack spacing={1}>
                                  <TrendingUp size={12} />
                                  <span>Positive</span>
                                </HStack>
                              ) : (
                                <HStack spacing={1}>
                                  <TrendingDown size={12} />
                                  <span>Negative</span>
                                </HStack>
                              )}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                      {/* Totals Row */}
                      <Tr bg="gray.100" fontWeight="bold">
                        <Td fontWeight="bold">TOTAL</Td>
                        <Td isNumeric color="green.700" fontSize="md">
                          {formatCurrency(yearlyTotals.income)}
                        </Td>
                        <Td isNumeric color="orange.700" fontSize="md">
                          -{formatCurrency(yearlyTotals.management)}
                        </Td>
                        <Td isNumeric color="red.700" fontSize="md">
                          -{formatCurrency(yearlyTotals.bills)}
                        </Td>
                        <Td
                          isNumeric
                          fontSize="lg"
                          color={
                            yearlyTotals.net >= 0 ? 'green.700' : 'red.700'
                          }
                        >
                          {formatCurrency(yearlyTotals.net)}
                        </Td>
                        <Td></Td>
                      </Tr>
                    </Tbody>
                  </Table>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Property Performance Analysis */}
          <Card shadow="lg">
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Rental Properties Section */}
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Building2 size={24} />
                      <Heading size="md">
                        Rental Properties Performance & ROI
                      </Heading>
                    </HStack>
                    <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                      {properties.filter((p) => p.is_rental === true).length}{' '}
                      Rental Properties
                    </Badge>
                  </HStack>

                  {properties.filter((p) => p.is_rental === true).length > 0 ? (
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Property</Th>
                          <Th isNumeric>Home Value</Th>
                          <Th isNumeric>Annual Income / Expenses</Th>
                          <Th isNumeric>Annual Bills</Th>
                          <Th isNumeric>Net Annual</Th>
                          <Th isNumeric>Current ROI %</Th>
                          <Th isNumeric>ROI (No Mortgage) %</Th>
                          <Th>Performance</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {properties
                          .filter((p) => p.is_rental === true)
                          .map((prop) => {
                            // Calculate annual income
                            const annualIncome = Number(prop.monthly_rent) * 12

                            // Calculate annual management & expenses
                            const annualManagement =
                              ((Number(prop.monthly_rent) *
                                Number(prop.property_management_percent)) /
                                100 +
                                Number(prop.extra_monthly_expenses || 0)) *
                              12

                            // Calculate annual bills for this property
                            const propertyBills = recurringBills.filter(
                              (bill) => bill.property_id === prop.id
                            )

                            let annualBillsTotal = 0
                            let annualMortgagePrincipalInterest = 0

                            propertyBills.forEach((bill) => {
                              let billAmount = 0
                              let escrowAmount = 0

                              if (
                                bill.is_one_time &&
                                bill.one_time_year === currentYear
                              ) {
                                billAmount = Number(bill.amount)
                                escrowAmount = Number(bill.escrow_amount || 0)
                              } else if (bill.frequency === 'monthly') {
                                billAmount = Number(bill.amount) * 12
                                escrowAmount =
                                  Number(bill.escrow_amount || 0) * 12
                              } else if (bill.frequency === 'annual') {
                                billAmount = Number(bill.amount)
                                escrowAmount = Number(bill.escrow_amount || 0)
                              } else if (bill.frequency === 'quarterly') {
                                billAmount = Number(bill.amount) * 4
                                escrowAmount =
                                  Number(bill.escrow_amount || 0) * 4
                              } else if (bill.frequency === 'semi-annual') {
                                billAmount = Number(bill.amount) * 2
                                escrowAmount =
                                  Number(bill.escrow_amount || 0) * 2
                              }

                              // Add escrow to bill amount for total
                              const totalBillAmount = billAmount + escrowAmount
                              annualBillsTotal += totalBillAmount

                              // Track mortgage P&I separately (this is what goes away after payoff)
                              if (bill.category === 'mortgage') {
                                // Only the principal & interest portion goes away after payoff
                                // Escrow (taxes + insurance) still needs to be paid
                                annualMortgagePrincipalInterest += billAmount
                              }
                            })

                            const annualNet =
                              annualIncome - annualManagement - annualBillsTotal
                            const annualNetNoMortgage =
                              annualIncome -
                              annualManagement -
                              (annualBillsTotal -
                                annualMortgagePrincipalInterest)

                            const roi =
                              prop.purchase_price > 0
                                ? (annualNet / prop.purchase_price) * 100
                                : 0

                            const roiNoMortgage =
                              prop.purchase_price > 0
                                ? (annualNetNoMortgage / prop.purchase_price) *
                                  100
                                : 0

                            // Determine performance rating (based on current ROI)
                            let performanceColor = 'gray'
                            let performanceLabel = 'N/A'
                            if (prop.purchase_price > 0) {
                              if (roi >= 8) {
                                performanceColor = 'green'
                                performanceLabel = 'Excellent'
                              } else if (roi >= 5) {
                                performanceColor = 'blue'
                                performanceLabel = 'Good'
                              } else if (roi >= 3) {
                                performanceColor = 'yellow'
                                performanceLabel = 'Fair'
                              } else if (roi >= 0) {
                                performanceColor = 'orange'
                                performanceLabel = 'Below Target'
                              } else {
                                performanceColor = 'red'
                                performanceLabel = 'Loss'
                              }
                            }

                            return (
                              <Tr key={prop.id}>
                                <Td fontWeight="semibold">
                                  <VStack align="start" spacing={0}>
                                    <Text>{prop.name}</Text>
                                    {prop.is_paid_off && (
                                      <Badge colorScheme="green" fontSize="xs">
                                        ✓ Paid Off
                                      </Badge>
                                    )}
                                  </VStack>
                                </Td>
                                <Td isNumeric color="gray.600" fontSize="sm">
                                  {prop.purchase_price > 0
                                    ? new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                      }).format(prop.purchase_price)
                                    : '-'}
                                </Td>
                                <Td isNumeric>
                                  <VStack spacing={0} align="end">
                                    <Text
                                      color="green.600"
                                      fontWeight="medium"
                                      fontSize="sm"
                                    >
                                      {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                      }).format(annualIncome)}
                                    </Text>
                                    <Text color="orange.600" fontSize="xs">
                                      -{formatCurrency(annualManagement)}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td isNumeric color="red.600">
                                  <VStack spacing={0} align="end">
                                    <Text fontSize="sm">
                                      {formatCurrency(annualBillsTotal)}
                                    </Text>
                                    {annualMortgagePrincipalInterest > 0 && (
                                      <Text
                                        fontSize="xs"
                                        color="gray.500"
                                        whiteSpace="nowrap"
                                      >
                                        P&I:{' '}
                                        {formatCurrency(
                                          annualMortgagePrincipalInterest
                                        )}
                                      </Text>
                                    )}
                                  </VStack>
                                </Td>
                                <Td
                                  isNumeric
                                  fontWeight="bold"
                                  color={
                                    annualNet >= 0 ? 'green.700' : 'red.700'
                                  }
                                  fontSize="sm"
                                >
                                  {formatCurrency(annualNet)}
                                </Td>
                                <Td
                                  isNumeric
                                  fontWeight="bold"
                                  fontSize="md"
                                  color={
                                    roi >= 5
                                      ? 'green.600'
                                      : roi >= 3
                                      ? 'blue.600'
                                      : roi >= 0
                                      ? 'orange.600'
                                      : 'red.600'
                                  }
                                >
                                  {prop.purchase_price > 0
                                    ? `${roi.toFixed(2)}%`
                                    : '-'}
                                </Td>
                                <Td
                                  isNumeric
                                  fontWeight="bold"
                                  fontSize="md"
                                  color={
                                    roiNoMortgage >= 5
                                      ? 'green.600'
                                      : roiNoMortgage >= 3
                                      ? 'blue.600'
                                      : 'gray.600'
                                  }
                                >
                                  {prop.purchase_price > 0 ? (
                                    <VStack spacing={0} align="end">
                                      <Text>{roiNoMortgage.toFixed(2)}%</Text>
                                      {annualMortgagePrincipalInterest > 0 && (
                                        <Text fontSize="xs" color="green.600">
                                          +{(roiNoMortgage - roi).toFixed(2)}%
                                        </Text>
                                      )}
                                    </VStack>
                                  ) : (
                                    '-'
                                  )}
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={performanceColor}
                                    fontSize="xs"
                                    px={2}
                                    py={1}
                                  >
                                    {performanceLabel}
                                  </Badge>
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
                      <Text mt={2}>No rental properties to analyze</Text>
                    </Box>
                  )}
                </VStack>

                <Divider />

                {/* Primary Residence Section */}
                {properties.filter((p) => p.is_rental === false).length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={3}>
                      <Home size={24} />
                      <Heading size="md">Primary Residence</Heading>
                    </HStack>

                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Property</Th>
                          <Th isNumeric>Home Value</Th>
                          <Th isNumeric>Annual Bills</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {properties
                          .filter((p) => p.is_rental === false)
                          .map((prop) => {
                            // Calculate annual bills for primary residence
                            const propertyBills = recurringBills.filter(
                              (bill) => bill.property_id === prop.id
                            )

                            let annualBills = 0
                            propertyBills.forEach((bill) => {
                              const billAmount = Number(bill.amount)
                              const escrowAmount = Number(
                                bill.escrow_amount || 0
                              )

                              if (
                                bill.is_one_time &&
                                bill.one_time_year === currentYear
                              ) {
                                annualBills += billAmount + escrowAmount
                              } else if (bill.frequency === 'monthly') {
                                annualBills += (billAmount + escrowAmount) * 12
                              } else if (bill.frequency === 'annual') {
                                annualBills += billAmount + escrowAmount
                              } else if (bill.frequency === 'quarterly') {
                                annualBills += (billAmount + escrowAmount) * 4
                              } else if (bill.frequency === 'semi-annual') {
                                annualBills += (billAmount + escrowAmount) * 2
                              }
                            })

                            return (
                              <Tr key={prop.id} bg="blue.50">
                                <Td fontWeight="semibold">
                                  <VStack align="start" spacing={0}>
                                    <Text>{prop.name}</Text>
                                    <Badge colorScheme="blue" fontSize="xs">
                                      Primary Residence
                                    </Badge>
                                  </VStack>
                                </Td>
                                <Td
                                  isNumeric
                                  color="gray.700"
                                  fontWeight="medium"
                                >
                                  {prop.purchase_price > 0
                                    ? formatCurrency(prop.purchase_price)
                                    : '-'}
                                </Td>
                                <Td isNumeric color="red.600">
                                  {formatCurrency(annualBills)}
                                </Td>
                                <Td>
                                  <Badge colorScheme="purple" fontSize="xs">
                                    Not income-generating
                                  </Badge>
                                </Td>
                              </Tr>
                            )
                          })}
                      </Tbody>
                    </Table>
                  </VStack>
                )}

                {/* Total Assets Summary */}
                <Card bg="purple.50" borderWidth={2} borderColor="purple.300">
                  <CardBody p={4}>
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm" color="purple.800">
                        Total Property Assets
                      </Heading>
                      <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                        <VStack align="start" spacing={1}>
                          <Text
                            fontSize="xs"
                            color="purple.700"
                            fontWeight="semibold"
                          >
                            Total Properties
                          </Text>
                          <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            color="purple.800"
                          >
                            {properties.length}
                          </Text>
                          <Text fontSize="xs" color="purple.600">
                            {
                              properties.filter((p) => p.is_rental === true)
                                .length
                            }{' '}
                            rental +{' '}
                            {
                              properties.filter((p) => p.is_rental === false)
                                .length
                            }{' '}
                            primary
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text
                            fontSize="xs"
                            color="purple.700"
                            fontWeight="semibold"
                          >
                            Total Home Value
                          </Text>
                          <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            color="purple.800"
                          >
                            {formatCurrency(
                              properties.reduce(
                                (sum, p) => sum + Number(p.purchase_price || 0),
                                0
                              )
                            )}
                          </Text>
                          <Text fontSize="xs" color="purple.600">
                            Combined property values
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text
                            fontSize="xs"
                            color="purple.700"
                            fontWeight="semibold"
                          >
                            Paid Off Properties
                          </Text>
                          <Text
                            fontSize="2xl"
                            fontWeight="bold"
                            color="green.700"
                          >
                            {properties.filter((p) => p.is_paid_off).length}
                          </Text>
                          <Text fontSize="xs" color="purple.600">
                            {
                              properties.filter(
                                (p) => p.is_paid_off && p.is_rental === true
                              ).length
                            }{' '}
                            rental paid off
                          </Text>
                        </VStack>
                      </Grid>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Performance Context */}
                <Card bg="blue.50" borderWidth={1} borderColor="blue.200">
                  <CardBody p={4}>
                    <VStack align="start" spacing={2}>
                      <Heading size="xs" color="blue.800">
                        ROI Benchmarks & Notes
                      </Heading>
                      <Grid templateColumns="repeat(4, 1fr)" gap={4} w="full">
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="xs"
                            color="blue.700"
                            fontWeight="semibold"
                          >
                            Excellent
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="green.600"
                          >
                            ≥ 8%
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="xs"
                            color="blue.700"
                            fontWeight="semibold"
                          >
                            Good
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            5-8%
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="xs"
                            color="blue.700"
                            fontWeight="semibold"
                          >
                            Fair
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="yellow.600"
                          >
                            3-5%
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={0}>
                          <Text
                            fontSize="xs"
                            color="blue.700"
                            fontWeight="semibold"
                          >
                            Typical CD Rate
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.600"
                          >
                            4-5%
                          </Text>
                        </VStack>
                      </Grid>
                      <Text fontSize="xs" color="blue.700" mt={2}>
                        <strong>Current ROI:</strong> Based on current net
                        income including mortgage payments.{' '}
                        <strong>ROI (No Mortgage):</strong> Shows potential ROI
                        once mortgage P&I is paid off (taxes and insurance still
                        apply). The difference shows the mortgage impact on
                        returns.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}
