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
  StatHelpText
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Property {
  id: number
  name: string
  monthly_rent: number
  property_management_percent: number
  extra_monthly_expenses: number
  hoa_fee: number
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

      // Bills for this month
      const billsForMonth = getBillsForMonth(bills, month)
      const billsTotal = billsForMonth.reduce(
        (sum, b) => sum + Number(b.amount),
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

            <CardBody py={6} position="relative" zIndex={1}>
              <HStack justify="space-between" align="center">
                {/* Left: Back button + Title */}
                <HStack spacing={4}>
                  <IconButton
                    aria-label="Back to monthly view"
                    icon={<ArrowLeft size={20} />}
                    onClick={() => router.push('/')}
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    _hover={{ bg: 'whiteAlpha.300' }}
                  />
                  <VStack align="start" spacing={0.5}>
                    <Heading size="lg" fontWeight="700" letterSpacing="tight">
                      Yearly Cash Flow
                    </Heading>
                    <Text fontSize="sm" opacity={0.9} fontWeight="500">
                      Annual performance overview
                    </Text>
                  </VStack>
                </HStack>

                {/* Center: Year Selector */}
                <HStack
                  spacing={3}
                  bg="whiteAlpha.200"
                  px={6}
                  py={3}
                  borderRadius="xl"
                  backdropFilter="blur(20px)"
                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <IconButton
                    aria-label="Previous year"
                    icon={<ChevronLeft size={20} />}
                    onClick={() => changeYear(-1)}
                    size="sm"
                    colorScheme="whiteAlpha"
                    variant="ghost"
                    _hover={{ bg: 'whiteAlpha.300' }}
                    borderRadius="lg"
                  />
                  <Text
                    fontSize="2xl"
                    fontWeight="700"
                    minW="100px"
                    textAlign="center"
                  >
                    {currentYear}
                  </Text>
                  <IconButton
                    aria-label="Next year"
                    icon={<ChevronRight size={20} />}
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
                  px={6}
                  py={3}
                  borderRadius="xl"
                  border="2px solid"
                  borderColor={yearlyTotals.net >= 0 ? 'green.300' : 'red.300'}
                  boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                  spacing={4}
                >
                  <HStack spacing={3}>
                    <Box
                      as={DollarSign}
                      size={18}
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
                        fontSize="2xl"
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
                    px={3}
                    py={1}
                    borderRadius="md"
                    alignSelf="center"
                  >
                    {yearlyTotals.net >= 0 ? '↑ Positive' : '↓ Negative'}
                  </Badge>
                </HStack>
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
        </VStack>
      </Container>
    </Box>
  )
}
