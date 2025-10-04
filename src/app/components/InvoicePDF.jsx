// // import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"
// // import { toWords } from "number-to-words"

// // const styles = StyleSheet.create({
// //   page: {
// //     padding: 50,
// //     fontSize: 10,
// //     fontFamily: "Helvetica",
// //     backgroundColor: "#ffffff",
// //     border: "2 solid #007BFF",
// //   },
// //   logo: {
// //     width: 90,
// //     height: 80,
// //   },
// //   headerContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "flex-start",
// //     marginBottom: 10,
// //   },
// //   companyTextWrapper: {
// //     flex: 1,
// //     marginLeft: 20,
// //   },
// //   companyInfo: {
// //     fontSize: 10,
// //     lineHeight: 1.3,
// //     textAlign: "left",
// //   },
// //   doubleLineContainer: {
// //     marginVertical: 8,
// //   },
// //   line: {
// //     borderBottomWidth: 1,
// //     borderColor: "#000",
// //     marginVertical: 1,
// //   },
// //   invoiceTitleCentered: {
// //     textAlign: "center",
// //     fontWeight: "bold",
// //     fontSize: 11,
// //     marginVertical: 2,
// //   },
// //   infoBlock: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginBottom: 6,
// //   },
// //   leftInfo: {
// //     flex: 1,
// //     fontSize: 10,
// //     lineHeight: 1.3,
// //   },
// //   rightInfo: {
// //     fontSize: 9,
// //     textAlign: "right",
// //     lineHeight: 1.5,
// //   },
// //   tableHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     backgroundColor: "#eeeeee",
// //     padding: 5,
// //     marginTop: 10,
// //   },
// //   tableRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     padding: 5,
// //   },
// //   tableCellHeader: {
// //     flex: 1,
// //     fontSize: 10,
// //     fontWeight: "bold",
// //   },
// //   tableCell: {
// //     flex: 1,
// //     fontSize: 10,
// //   },
// //   tableAmount: {
// //     flex: 1,
// //     fontSize: 10,
// //     textAlign: "right",
// //   },
// //   rowDivider: {
// //     borderBottomWidth: 0.5,
// //     borderColor: "#ccc",
// //     marginHorizontal: 5,
// //   },
// //   totalsRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginTop: 10,
// //   },
// //   totalWords: {
// //     flex: 1,
// //     fontStyle: "italic",
// //   },
// //   totalNumber: {
// //     flex: 1,
// //     textAlign: "right",
// //     fontWeight: "bold",
// //   },
// //   footer: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     marginTop: 20,
// //   },
// //   terms: {
// //     flex: 1,
// //     fontSize: 10,
// //     lineHeight: 1.5,
// //   },
// //   signBox: {
// //     width: 110,
// //     marginTop: 20,
// //     height: 100,
// //   },
// // })

// // const numberToWords = (amount) => {
// //   try {
// //     // Handle decimal part properly
// //     const integerPart = Math.floor(amount)
// //     return toWords(integerPart).replace(/\b\w/g, (l) => l.toUpperCase()) + " Rupees Only"
// //   } catch (error) {
// //     console.error("Error converting number to words:", error)
// //     return "Amount in words unavailable"
// //   }
// // }

// // // Helper function to safely extract and sum amounts from various possible locations
// // const extractAmounts = (data, paths) => {
// //   if (!data) return 0

// //   // Try each possible path to find the amount data
// //   for (const path of paths) {
// //     const parts = path.split(".")
// //     let current = data

// //     // Navigate through the object path
// //     for (const part of parts) {
// //       if (!current || typeof current !== "object") {
// //         current = null
// //         break
// //       }
// //       current = current[part]
// //     }

// //     // If we found an array of amounts, sum them
// //     if (Array.isArray(current)) {
// //       // Convert each item to a number, handling string formatting
// //       const sum = current.reduce((sum, amt) => {
// //         if (amt === null || amt === undefined) return sum
        
// //         // If it's a string with currency symbols or commas, clean it up
// //         if (typeof amt === 'string') {
// //           // Remove currency symbols, commas, and other non-numeric characters except decimal point
// //           const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //           return sum + (Number(cleanedAmount) || 0)
// //         }
        
// //         return sum + (Number(amt) || 0)
// //       }, 0)
      
// //       if (sum > 0) return sum
// //     }
// //     // If we found a single amount, return it
// //     else if (current !== undefined && current !== null) {
// //       if (typeof current === 'string') {
// //         // Remove currency symbols, commas, and other non-numeric characters except decimal point
// //         const cleanedAmount = current.replace(/[^\d.-]/g, '')
// //         return Number(cleanedAmount) || 0
// //       }
// //       return Number(current) || 0
// //     }
// //   }

// //   return 0
// // }

// // // Function to directly access a nested property using a path string
// // const getNestedValue = (obj, path) => {
// //   if (!obj || !path) return undefined
  
// //   const parts = path.split('.')
// //   let current = obj
  
// //   for (const part of parts) {
// //     if (current === null || current === undefined || typeof current !== 'object') {
// //       return undefined
// //     }
// //     current = current[part]
// //   }
  
// //   return current
// // }


// // const InvoicePDF = ({
// //   cabData,
// //   trip,
// //   cabExpense,
// //   companyLogo,
// //   invoiceNumber,
// //   signature,
// //   companyInfo,
// //   companyPrefix,
// //   companyName,
// //   invoiceDate,
// // }) => {
// //   if (!trip) return null

// //   // Debug the data structure
// //   console.log("INVOICE DATA:", {
// //     tripData: trip,
// //     cabData: cabData,
// //     cabExpense: cabExpense,
// //   })

// //   // First try to use the cabExpense data from the API if available
// //   let fuelAmount = 0
// //   let fastTagAmount = 0
// //   let tyreAmount = 0
// //   let otherAmount = 0

// //   // Direct access to specific paths that might contain the amounts
// //   // For fuel amount
// //   const directFuelPaths = [
// //     'cab.fuel.amount',
// //     'tripDetails.fuel.amount',
// //     'fuel.amount'
// //   ]
  
// //   // Try to find fuel amount directly in the trip object
// //   for (const path of directFuelPaths) {
// //     const value = getNestedValue(trip, path)
// //     if (value) {
// //       console.log(`Found fuel amount at ${path}:`, value)
// //       if (Array.isArray(value)) {
// //         fuelAmount = value.reduce((sum, amt) => {
// //           if (typeof amt === 'string') {
// //             // Clean the string value
// //             const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //             return sum + (Number(cleanedAmount) || 0)
// //           }
// //           return sum + (Number(amt) || 0)
// //         }, 0)
// //       } else if (typeof value === 'string') {
// //         fuelAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //       } else {
// //         fuelAmount = Number(value) || 0
// //       }
      
// //       if (fuelAmount > 0) break
// //     }
// //   }
  
// //   if (fuelAmount === 0 && cabData && cabData.fuel && cabData.fuel.amount) {
// //     const value = cabData.fuel.amount
// //     console.log("Found fuel amount in cabData:", value)
// //     if (Array.isArray(value)) {
// //       fuelAmount = value.reduce((sum, amt) => {
// //         if (typeof amt === 'string') {
// //           const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //           return sum + (Number(cleanedAmount) || 0)
// //         }
// //         return sum + (Number(amt) || 0)
// //       }, 0)
// //     } else if (typeof value === 'string') {
// //       fuelAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //     } else {
// //       fuelAmount = Number(value) || 0
// //     }
// //   }

// //   // For FastTag amount
// //   const directFastTagPaths = [
// //     'cab.fastTag.amount',
// //     'tripDetails.fastTag.amount',
// //     'fastTag.amount'
// //   ]
  
// //   // Try to find FastTag amount directly
// //   for (const path of directFastTagPaths) {
// //     const value = getNestedValue(trip, path)
// //     if (value) {
// //       console.log(`Found FastTag amount at ${path}:`, value)
// //       if (Array.isArray(value)) {
// //         fastTagAmount = value.reduce((sum, amt) => {
// //           if (typeof amt === 'string') {
// //             const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //             return sum + (Number(cleanedAmount) || 0)
// //           }
// //           return sum + (Number(amt) || 0)
// //         }, 0)
// //       } else if (typeof value === 'string') {
// //         fastTagAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //       } else {
// //         fastTagAmount = Number(value) || 0
// //       }
      
// //       if (fastTagAmount > 0) break
// //     }
// //   }
  
// //   // If not found in trip, try cabData
// //   if (fastTagAmount === 0 && cabData && cabData.fastTag && cabData.fastTag.amount) {
// //     const value = cabData.fastTag.amount
// //     console.log("Found FastTag amount in cabData:", value)
// //     if (Array.isArray(value)) {
// //       fastTagAmount = value.reduce((sum, amt) => {
// //         if (typeof amt === 'string') {
// //           const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //           return sum + (Number(cleanedAmount) || 0)
// //         }
// //         return sum + (Number(amt) || 0)
// //       }, 0)
// //     } else if (typeof value === 'string') {
// //       fastTagAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //     } else {
// //       fastTagAmount = Number(value) || 0
// //     }
// //   }

// //   // For Tyre amount
// //   const directTyrePaths = [
// //     'cab.tyrePuncture.repairAmount',
// //     'tripDetails.tyrePuncture.repairAmount',
// //     'tyrePuncture.repairAmount'
// //   ]
  
// //   // Try to find tyre amount directly
// //   for (const path of directTyrePaths) {
// //     const value = getNestedValue(trip, path)
// //     if (value) {
// //       console.log(`Found tyre amount at ${path}:`, value)
// //       if (Array.isArray(value)) {
// //         tyreAmount = value.reduce((sum, amt) => {
// //           if (typeof amt === 'string') {
// //             const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //             return sum + (Number(cleanedAmount) || 0)
// //           }
// //           return sum + (Number(amt) || 0)
// //         }, 0)
// //       } else if (typeof value === 'string') {
// //         tyreAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //       } else {
// //         tyreAmount = Number(value) || 0
// //       }
      
// //       if (tyreAmount > 0) break
// //     }
// //   }
  
// //   // If not found in trip, try cabData
// //   if (tyreAmount === 0 && cabData && cabData.tyrePuncture && cabData.tyrePuncture.repairAmount) {
// //     const value = cabData.tyrePuncture.repairAmount
// //     console.log("Found tyre amount in cabData:", value)
// //     if (Array.isArray(value)) {
// //       tyreAmount = value.reduce((sum, amt) => {
// //         if (typeof amt === 'string') {
// //           const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //           return sum + (Number(cleanedAmount) || 0)
// //         }
// //         return sum + (Number(amt) || 0)
// //       }, 0)
// //     } else if (typeof value === 'string') {
// //       tyreAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //     } else {
// //       tyreAmount = Number(value) || 0
// //     }
// //   }

// //   // For Other Problems amount
// //   const directOtherPaths = [
// //     'cab.otherProblems.amount',
// //     'tripDetails.otherProblems.amount',
// //     'otherProblems.amount'
// //   ]
  
// //   // Try to find other problems amount directly
// //   for (const path of directOtherPaths) {
// //     const value = getNestedValue(trip, path)
// //     if (value) {
// //       console.log(`Found other problems amount at ${path}:`, value)
// //       if (Array.isArray(value)) {
// //         otherAmount = value.reduce((sum, amt) => {
// //           if (typeof amt === 'string') {
// //             const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //             return sum + (Number(cleanedAmount) || 0)
// //           }
// //           return sum + (Number(amt) || 0)
// //         }, 0)
// //       } else if (typeof value === 'string') {
// //         otherAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //       } else {
// //         otherAmount = Number(value) || 0
// //       }
      
// //       if (otherAmount > 0) break
// //     }
// //   }
  
// //   // If not found in trip, try cabData
// //   if (otherAmount === 0 && cabData && cabData.otherProblems && cabData.otherProblems.amount) {
// //     const value = cabData.otherProblems.amount
// //     console.log("Found other problems amount in cabData:", value)
// //     if (Array.isArray(value)) {
// //       otherAmount = value.reduce((sum, amt) => {
// //         if (typeof amt === 'string') {
// //           const cleanedAmount = amt.replace(/[^\d.-]/g, '')
// //           return sum + (Number(cleanedAmount) || 0)
// //         }
// //         return sum + (Number(amt) || 0)
// //       }, 0)
// //     } else if (typeof value === 'string') {
// //       otherAmount = Number(value.replace(/[^\d.-]/g, '')) || 0
// //     } else {
// //       otherAmount = Number(value) || 0
// //     }
// //   }

// //   // Log the extracted amounts for debugging
// //   console.log("Extracted Amounts:", {
// //     fuelAmount,
// //     fastTagAmount,
// //     tyreAmount,
// //     otherAmount,
// //   })

// //   const subtotal = fuelAmount + fastTagAmount + tyreAmount + otherAmount
// //   const gst = subtotal * 0.05
// //   const totalAmount = subtotal + gst

// //   // Format number with commas for Indian numbering system (e.g., 1,00,000)
// //   const formatIndianNumber = (num) => {
// //     console.log("my fuel payment is null",num)
// //     console.log("my fuel isNan",isNaN(num))
// //     if (num == null  || isNaN(Number(num))) return '0.00';
// //     const parts = num.toFixed(2).split('.')
// //     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
// //     return parts.join('.')
// //   }
 
// //   return (
// //     <Document>
// //       <Page size="A4" style={styles.page}>
// //         <View style={styles.headerContainer}>
// //           <Image style={styles.logo} src={companyLogo || "/placeholder.svg"} />
// //           <View style={styles.companyTextWrapper}>
// //             {companyInfo ? (
// //               <>
// //                 <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>
// //                   {companyName || "Company Name"}
// //                 </Text>
// //                 <Text style={styles.companyInfo}>{companyInfo}</Text>
// //               </>
// //             ) : (
// //               <>
// //                 <Text style={[styles.companyInfo, { fontWeight: "bold", fontSize: 11 }]}>Company Name</Text>
// //                 <Text style={styles.companyInfo}>Address Line 1</Text>
// //                 <Text style={styles.companyInfo}>City, State, Zip</Text>
// //                 <Text style={styles.companyInfo}>Phone: 0000000000</Text>
// //                 <Text style={styles.companyInfo}>GSTIN: XXXXXXXXXXXX</Text>
// //               </>
// //             )}
// //           </View>
// //         </View>

// //         <View style={styles.doubleLineContainer}>
// //           <View style={styles.line} />
// //           <Text style={styles.invoiceTitleCentered}>TAX INVOICE</Text>
// //           <View style={styles.line} />
// //         </View>

// //         <View style={styles.infoBlock}>
// //           <View style={styles.leftInfo}>
// //             <Text style={{ fontWeight: "bold", color: "#007BFF" }}>Route BudgetPRIVATE LIMITED</Text>
// //             <Text>Floor No.: First Floor</Text>
// //             <Text>Office No. 016, A-Building, S No.53/2A/1, City Vista, Fountain Road, Pune</Text>
// //             <Text>State: Maharashtra, Pincode-411014</Text>
// //             <Text>Phone: 8237257618</Text>
// //             <Text>GSTIN: 27AADCW8531C1ZD</Text>
// //           </View>
// //           <View style={styles.rightInfo}>
// //             <Text>Original for Recipient</Text>
// //             <Text>Invoice Number: {invoiceNumber || "RADIANT-000000"}</Text>
// //             <Text>Invoice Date: {invoiceDate || new Date().toLocaleDateString("en-IN")}</Text>
// //             <Text>Cab Number: {trip.cab?.cabNumber || "N/A"}</Text>
// //           </View>
// //         </View>

// //         <View style={styles.tableHeader}>
// //           <Text style={styles.tableCellHeader}>Expense Type</Text>
// //           <Text style={[styles.tableCellHeader, { textAlign: "right" }]}>Amount</Text>
// //         </View>

// //         <View style={styles.tableRow}>
// //           <Text style={styles.tableCell}>Fuel</Text>
// //           <Text style={styles.tableAmount}>₹{formatIndianNumber(fuelAmount)}</Text>
// //         </View>
// //         <View style={styles.tableRow}>
// //           <Text style={styles.tableCell}>FastTag</Text>
// //           <Text style={styles.tableAmount}>{formatIndianNumber(fastTagAmount)}</Text>
// //         </View>
// //         <View style={styles.tableRow}>
// //           <Text style={styles.tableCell}>Tyre Puncture</Text>
// //           <Text style={styles.tableAmount}>{formatIndianNumber(tyreAmount)}</Text>
// //         </View>
// //         <View style={styles.tableRow}>
// //           <Text style={styles.tableCell}>Other Problems</Text>
// //           <Text style={styles.tableAmount}>{formatIndianNumber(otherAmount)}</Text>
// //         </View>

// //         <View style={styles.rowDivider} />

// //         <View style={styles.tableRow}>
// //           <Text style={[styles.tableCell, { fontWeight: "bold" }]}>Subtotal</Text>
// //           <Text style={styles.tableAmount}>{formatIndianNumber(subtotal)}</Text>
// //         </View>

// //         <View style={styles.tableRow}>
// //           <Text style={[styles.tableCell, { fontWeight: "bold" }]}>GST (5%)</Text>
// //           <Text style={styles.tableAmount}>{formatIndianNumber(gst)}</Text>
// //         </View>

// //         <View style={styles.rowDivider} />

// //         <View style={styles.totalsRow}>
// //           <Text style={styles.totalWords}>
// //             <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>{numberToWords(totalAmount)}</Text>
// //           </Text>
// //           <Text style={styles.totalNumber}>{formatIndianNumber(totalAmount)}</Text>
// //         </View>

// //         <View style={styles.footer}>
// //           <View style={styles.terms}>
// //             <Text style={{ fontWeight: "bold" }}>Terms & Conditions:</Text>
// //             <Text>1. Minimum Rs.500 will be charged if trip is canceled.</Text>
// //             <Text>2. Invoice will be cancelled if not paid in 7 days.</Text>
// //             <Text>3. Diesel above Rs.90/ltr may incur extra charges.</Text>
// //             <Text>4. Payment due within 15 days of invoice date.</Text>
// //             <Text>5. Late payments incur 2% monthly interest.</Text>
// //           </View>

// //           <View style={styles.signBox}>
// //             <Text style={{ fontSize: 8, textAlign: "center", marginTop: 10 }}>
// //               For {companyName || "________________"}
// //             </Text>
// //             {signature && <Image style={styles.signBox} src={signature || "/placeholder.svg"} />}
// //             <Text style={{ fontSize: 8, textAlign: "center", marginTop: 4 }}>Authorized Signatory</Text>
// //           </View>
// //         </View>
// //       </Page>
// //     </Document>
// //   )
// // }

// // export default InvoicePDF





// import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"

// const styles = StyleSheet.create({
//   page: {
//     padding: 40,
//     fontSize: 10,
//     fontFamily: "Helvetica",
//     backgroundColor: "#ffffff",
//   },

//   // Header Styles
//   headerContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 20,
//     paddingBottom: 15,
//     borderBottomWidth: 2,
//     borderBottomColor: "#2563eb",
//   },

//   logo: {
//     width: 80,
//     height: 70,
//   },

//   companyInfo: {
//     flex: 1,
//     marginLeft: 20,
//   },

//   companyName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#1f2937",
//     marginBottom: 5,
//   },

//   companyDetails: {
//     fontSize: 9,
//     color: "#6b7280",
//     lineHeight: 1.4,
//   },

//   reportTitle: {
//     textAlign: "center",
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1f2937",
//     marginVertical: 15,
//     textTransform: "uppercase",
//     letterSpacing: 1,
//   },

//   // Trip Information Section
//   tripInfoContainer: {
//     backgroundColor: "#f8fafc",
//     padding: 15,
//     marginBottom: 20,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//   },

//   sectionTitle: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#374151",
//     marginBottom: 10,
//     textTransform: "uppercase",
//     borderBottomWidth: 1,
//     borderBottomColor: "#d1d5db",
//     paddingBottom: 3,
//   },

//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },

//   infoLabel: {
//     fontSize: 10,
//     fontWeight: "bold",
//     color: "#4b5563",
//     flex: 1,
//   },

//   infoValue: {
//     fontSize: 10,
//     color: "#1f2937",
//     flex: 2,
//   },

//   // Route Information
//   routeContainer: {
//     backgroundColor: "#ecfdf5",
//     padding: 15,
//     marginBottom: 20,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#d1fae5",
//   },

//   routePoint: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 8,
//   },

//   routeIcon: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 10,
//   },

//   fromIcon: {
//     backgroundColor: "#10b981",
//   },

//   toIcon: {
//     backgroundColor: "#ef4444",
//   },

//   routeText: {
//     fontSize: 11,
//     color: "#1f2937",
//     fontWeight: "bold",
//   },

//   // Expense Table
//   tableContainer: {
//     marginBottom: 20,
//   },

//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#1f2937",
//     padding: 10,
//   },

//   tableHeaderCell: {
//     color: "#ffffff",
//     fontSize: 10,
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   tableRow: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     padding: 8,
//   },

//   tableRowAlt: {
//     backgroundColor: "#f9fafb",
//   },

//   tableCell: {
//     fontSize: 9,
//     color: "#374151",
//     textAlign: "center",
//   },

//   tableCellBold: {
//     fontSize: 9,
//     color: "#1f2937",
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   // Summary Section
//   summaryContainer: {
//     backgroundColor: "#fef3c7",
//     padding: 15,
//     marginBottom: 20,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#fbbf24",
//   },

//   summaryRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 5,
//   },

//   summaryLabel: {
//     fontSize: 11,
//     color: "#92400e",
//     fontWeight: "bold",
//   },

//   summaryValue: {
//     fontSize: 11,
//     color: "#92400e",
//     fontWeight: "bold",
//   },

//   totalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     borderTopWidth: 1,
//     borderTopColor: "#f59e0b",
//     paddingTop: 8,
//     marginTop: 8,
//   },

//   totalLabel: {
//     fontSize: 12,
//     color: "#92400e",
//     fontWeight: "bold",
//   },

//   totalValue: {
//     fontSize: 12,
//     color: "#92400e",
//     fontWeight: "bold",
//   },

//   // Driver & Vehicle Details
//   detailsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },

//   detailsBox: {
//     flex: 1,
//     backgroundColor: "#f1f5f9",
//     padding: 12,
//     marginHorizontal: 5,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: "#cbd5e1",
//   },

//   detailsTitle: {
//     fontSize: 11,
//     fontWeight: "bold",
//     color: "#334155",
//     marginBottom: 8,
//     textAlign: "center",
//   },

//   detailsText: {
//     fontSize: 9,
//     color: "#475569",
//     marginBottom: 3,
//   },

//   // Footer
//   footer: {
//     marginTop: 30,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: "#e5e7eb",
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   footerLeft: {
//     flex: 2,
//   },

//   footerRight: {
//     flex: 1,
//     alignItems: "center",
//   },

//   footerText: {
//     fontSize: 8,
//     color: "#6b7280",
//     lineHeight: 1.4,
//   },

//   signature: {
//     width: 80,
//     height: 40,
//     marginBottom: 5,
//   },

//   signatureText: {
//     fontSize: 8,
//     color: "#374151",
//     textAlign: "center",
//   },

//   // Status Badge
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 3,
//     alignSelf: "flex-start",
//   },

//   statusCompleted: {
//     backgroundColor: "#dcfce7",
//     color: "#166534",
//   },

//   statusAssigned: {
//     backgroundColor: "#fef3c7",
//     color: "#92400e",
//   },

//   statusText: {
//     fontSize: 8,
//     fontWeight: "bold",
//   },
// })

// // Helper function to format currency
// const formatCurrency = (amount) => {
//   if (amount == null || isNaN(Number(amount))) return "₹0.00"
//   const num = Number(amount)
//   return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
// }

// // Helper function to format date
// const formatDate = (dateString) => {
//   if (!dateString) return "N/A"
//   const date = new Date(dateString)
//   return date.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   })
// }

// // Helper function to format time
// const formatTime = (dateString) => {
//   if (!dateString) return "N/A"
//   const date = new Date(dateString)
//   return date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   })
// }

// // Helper function to calculate duration
// const calculateDuration = (startDate, endDate) => {
//   if (!startDate || !endDate) return "N/A"
//   const start = new Date(startDate)
//   const end = new Date(endDate)
//   const diffMs = end - start
//   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
//   const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

//   if (diffDays > 0) {
//     return `${diffDays} day${diffDays > 1 ? "s" : ""} ${diffHours} hour${diffHours > 1 ? "s" : ""}`
//   }
//   return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
// }

// // Helper function to extract amounts
// const extractAmount = (data, paths) => {
//   if (!data) return 0

//   for (const path of paths) {
//     const parts = path.split(".")
//     let current = data

//     for (const part of parts) {
//       if (!current || typeof current !== "object") {
//         current = null
//         break
//       }
//       current = current[part]
//     }

//     if (Array.isArray(current)) {
//       const sum = current.reduce((sum, amt) => {
//         if (amt === null || amt === undefined) return sum
//         if (typeof amt === "string") {
//           const cleanedAmount = amt.replace(/[^\d.-]/g, "")
//           return sum + (Number(cleanedAmount) || 0)
//         }
//         return sum + (Number(amt) || 0)
//       }, 0)
//       if (sum > 0) return sum
//     } else if (current !== undefined && current !== null) {
//       if (typeof current === "string") {
//         const cleanedAmount = current.replace(/[^\d.-]/g, "")
//         return Number(cleanedAmount) || 0
//       }
//       return Number(current) || 0
//     }
//   }
//   return 0
// }

// const InvoicePDF = ({ cabData, trip, companyLogo, signature, companyInfo, companyName, reportNumber }) => {
//   if (!trip) return null

//   // Extract expense amounts
//   const fuelAmount =
//     extractAmount(trip, ["cab.fuel.amount", "tripDetails.fuel.amount", "fuel.amount"]) ||
//     extractAmount(cabData, ["fuel.amount"])

//   const fastTagAmount =
//     extractAmount(trip, ["cab.fastTag.amount", "tripDetails.fastTag.amount", "fastTag.amount"]) ||
//     extractAmount(cabData, ["fastTag.amount"])

//   const tyreAmount =
//     extractAmount(trip, [
//       "cab.tyrePuncture.repairAmount",
//       "tripDetails.tyrePuncture.repairAmount",
//       "tyrePuncture.repairAmount",
//     ]) || extractAmount(cabData, ["tyrePuncture.repairAmount"])

//   const servicingAmount =
//     extractAmount(trip, [
//       "cab.vehicleServicing.amount",
//       "tripDetails.vehicleServicing.amount",
//       "vehicleServicing.amount",
//     ]) || extractAmount(cabData, ["vehicleServicing.amount"])

//   const otherAmount =
//     extractAmount(trip, ["cab.otherProblems.amount", "tripDetails.otherProblems.amount", "otherProblems.amount"]) ||
//     extractAmount(cabData, ["otherProblems.amount"])

//   const totalExpenses = fuelAmount + fastTagAmount + tyreAmount + servicingAmount + otherAmount
//   const reportDate = new Date().toLocaleDateString("en-IN")

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <Image style={styles.logo} src={companyLogo || "/placeholder.svg"} />
//           <View style={styles.companyInfo}>
//             <Text style={styles.companyName}>{companyName || "Fleet Management Company"}</Text>
//             <Text style={styles.companyDetails}>
//               {companyInfo ||
//                 "Complete Fleet Management Solutions\nAddress Line 1, City, State - 000000\nPhone: +91-0000000000 | Email: info@company.com"}
//             </Text>
//           </View>
//         </View>

//         {/* Report Title */}
//         <Text style={styles.reportTitle}>Trip Expense Report</Text>

//         {/* Trip Information */}
//         <View style={styles.tripInfoContainer}>
//           <Text style={styles.sectionTitle}>Trip Information</Text>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Report Number:</Text>
//             <Text style={styles.infoValue}>{reportNumber || `TR-${Date.now().toString().slice(-6)}`}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Report Date:</Text>
//             <Text style={styles.infoValue}>{reportDate}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Cab Number:</Text>
//             <Text style={styles.infoValue}>{trip.cab?.cabNumber || "N/A"}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Trip Status:</Text>
//             <View
//               style={[styles.statusBadge, trip.status === "completed" ? styles.statusCompleted : styles.statusAssigned]}
//             >
//               <Text
//                 style={[
//                   styles.statusText,
//                   trip.status === "completed" ? styles.statusCompleted : styles.statusAssigned,
//                 ]}
//               >
//                 {trip.status?.toUpperCase() || "ASSIGNED"}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Assigned Date:</Text>
//             <Text style={styles.infoValue}>{formatDate(trip.assignedAt)}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Trip Duration:</Text>
//             <Text style={styles.infoValue}>{calculateDuration(trip.assignedAt, trip.completedAt)}</Text>
//           </View>
//         </View>

//         {/* Route Information */}
//         <View style={styles.routeContainer}>
//           <Text style={styles.sectionTitle}>Route Details</Text>
//           <View style={styles.routePoint}>
//             <View style={[styles.routeIcon, styles.fromIcon]} />
//             <Text style={styles.routeText}>From: {trip.tripDetails?.location?.from || "N/A"}</Text>
//           </View>
//           <View style={styles.routePoint}>
//             <View style={[styles.routeIcon, styles.toIcon]} />
//             <Text style={styles.routeText}>To: {trip.tripDetails?.location?.to || "N/A"}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.infoLabel}>Total Distance:</Text>
//             <Text style={styles.infoValue}>{trip.tripDetails?.location?.totalDistance || "0"} KM</Text>
//           </View>
//         </View>

//         {/* Driver & Vehicle Details */}
//         <View style={styles.detailsContainer}>
//           <View style={styles.detailsBox}>
//             <Text style={styles.detailsTitle}>Driver Information</Text>
//             <Text style={styles.detailsText}>Name: {trip.driver?.name || "N/A"}</Text>
//             <Text style={styles.detailsText}>License: {trip.driver?.licenseNumber || "N/A"}</Text>
//             <Text style={styles.detailsText}>Phone: {trip.driver?.phone || "N/A"}</Text>
//             <Text style={styles.detailsText}>Experience: {trip.driver?.experience || "N/A"} years</Text>
//           </View>
//           <View style={styles.detailsBox}>
//             <Text style={styles.detailsTitle}>Vehicle Information</Text>
//             <Text style={styles.detailsText}>Model: {trip.cab?.model || "N/A"}</Text>
//             <Text style={styles.detailsText}>Year: {trip.cab?.year || "N/A"}</Text>
//             <Text style={styles.detailsText}>Fuel Type: {trip.cab?.fuelType || "N/A"}</Text>
//             <Text style={styles.detailsText}>Capacity: {trip.cab?.seatingCapacity || "N/A"} seats</Text>
//           </View>
//         </View>

//         {/* Expense Table */}
//         <View style={styles.tableContainer}>
//           <Text style={styles.sectionTitle}>Expense Breakdown</Text>

//           {/* Table Header */}
//           <View style={styles.tableHeader}>
//             <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Expense Category</Text>
//             <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Amount</Text>
//             <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Date</Text>
//             <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
//           </View>

//           {/* Fuel Row */}
//           <View style={[styles.tableRow, fuelAmount > 0 ? {} : styles.tableRowAlt]}>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Fuel Expenses</Text>
//             <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(fuelAmount)}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Fuel consumption during trip</Text>
//           </View>

//           {/* FastTag Row */}
//           <View style={[styles.tableRow, styles.tableRowAlt]}>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Toll Charges (FastTag)</Text>
//             <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(fastTagAmount)}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Highway toll payments</Text>
//           </View>

//           {/* Tyre Row */}
//           <View style={styles.tableRow}>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Tyre Maintenance</Text>
//             <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(tyreAmount)}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Tyre repair and maintenance</Text>
//           </View>

//           {/* Servicing Row */}
//           <View style={[styles.tableRow, styles.tableRowAlt]}>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Vehicle Servicing</Text>
//             <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(servicingAmount)}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Regular maintenance and servicing</Text>
//           </View>

//           {/* Other Expenses Row */}
//           <View style={styles.tableRow}>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Other Expenses</Text>
//             <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(otherAmount)}</Text>
//             <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
//             <Text style={[styles.tableCell, { flex: 2 }]}>Miscellaneous trip expenses</Text>
//           </View>
//         </View>

//         {/* Summary */}
//         <View style={styles.summaryContainer}>
//           <Text style={styles.sectionTitle}>Expense Summary</Text>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Total Fuel Expenses:</Text>
//             <Text style={styles.summaryValue}>{formatCurrency(fuelAmount)}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Total Toll Charges:</Text>
//             <Text style={styles.summaryValue}>{formatCurrency(fastTagAmount)}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Total Maintenance:</Text>
//             <Text style={styles.summaryValue}>{formatCurrency(tyreAmount + servicingAmount)}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Other Expenses:</Text>
//             <Text style={styles.summaryValue}>{formatCurrency(otherAmount)}</Text>
//           </View>
//           <View style={styles.totalRow}>
//             <Text style={styles.totalLabel}>TOTAL TRIP EXPENSES:</Text>
//             <Text style={styles.totalValue}>{formatCurrency(totalExpenses)}</Text>
//           </View>
//         </View>

//         {/* Footer */}
//         <View style={styles.footer}>
//           <View style={styles.footerLeft}>
//             <Text style={styles.footerText}>
//               This report is generated automatically by the Fleet Management System.{"\n"}
//               Report generated on: {new Date().toLocaleString("en-IN")}
//               {"\n"}
//               For any queries, please contact the fleet management team.{"\n\n"}
//               Note: All expenses are subject to verification and approval.
//             </Text>
//           </View>
//           <View style={styles.footerRight}>
//             <Text style={styles.signatureText}>Authorized By</Text>
//             {signature && <Image style={styles.signature} src={signature || "/placeholder.svg"} />}
//             <Text style={styles.signatureText}>Fleet Manager</Text>
//             <Text style={styles.signatureText}>{companyName || "Company Name"}</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   )
// }

// export default InvoicePDF








import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header Styles
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  logo: {
    width: 80,
    height: 70,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  reportTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginVertical: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Trip Information Section
  tripInfoContainer: {
    backgroundColor: "#f8fafc",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
    flex: 1,
  },
  infoValue: {
    fontSize: 10,
    color: "#1f2937",
    flex: 2,
  },
 //this is styling part of routebudget
  routeContainer: {
    backgroundColor: "#ecfdf5",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  routeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  fromIcon: {
    backgroundColor: "#10b981",
  },
  toIcon: {
    backgroundColor: "#ef4444",
  },
  routeText: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "bold",
  },
  // Expense Table
  tableContainer: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    padding: 10,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
    textAlign: "center",
  },
  tableCellBold: {
    fontSize: 9,
    color: "#1f2937",
    fontWeight: "bold",
    textAlign: "center",
  },
  // Summary Section
  summaryContainer: {
    backgroundColor: "#fef3c7",
    padding: 15,
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fbbf24",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#92400e",
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 11,
    color: "#92400e",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f59e0b",
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "bold",
  },
  // Driver & Vehicle Details
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailsBox: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  detailsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
    textAlign: "center",
  },
  detailsText: {
    fontSize: 9,
    color: "#475569",
    marginBottom: 3,
  },
  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 2,
  },
  footerRight: {
    flex: 1,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
  signature: {
    width: 80,
    height: 40,
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 8,
    color: "#374151",
    textAlign: "center",
  },
  // Status Badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
  statusCompleted: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusAssigned: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  statusText: {
    fontSize: 8,
    fontWeight: "bold",
  },
})

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount == null || isNaN(Number(amount))) return "₹0.00"
  const num = Number(amount)
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Helper function to calculate duration
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A"
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ${diffHours} hour${diffHours > 1 ? "s" : ""}`
  }
  return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
}

const InvoicePDF = ({ trip, companyLogo, signature, companyInfo, companyName, reportNumber }) => {
  if (!trip) return null

  // Calculate total expenses from the item's CabDetail
  const calculateTotalExpenses = (cabDetail) => {
    const fuel = cabDetail.fuel_amount?.reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0) || 0
    const fastTag = cabDetail.fastTag_amount?.reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0) || 0
    const tyre =
      cabDetail.tyrePuncture_repairAmount?.reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0) || 0
    const servicing =
      cabDetail.servicing_amount?.reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0) || 0
    const other =
      cabDetail.otherProblems_amount?.reduce((sum, amount) => sum + Number.parseFloat(amount || "0"), 0) || 0
    return {
      fuel: fuel,
      fastTag: fastTag,
      tyre: tyre,
      servicing: servicing,
      other: other,
      total: fuel + fastTag + tyre + servicing + other,
    }
  }

  const expenses = trip.CabDetail
    ? calculateTotalExpenses(trip.CabDetail)
    : { fuel: 0, fastTag: 0, tyre: 0, servicing: 0, other: 0, total: 0 }
  const reportDate = new Date().toLocaleDateString("en-IN")

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image style={styles.logo} src={companyLogo || "/placeholder.svg"} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyName || "Fleet Management Company"}</Text>
            <Text style={styles.companyDetails}>
              {companyInfo ||
                "Complete Fleet Management Solutions\nAddress Line 1, City, State - 000000\nPhone: +91-0000000000 | Email: info@company.com"}
            </Text>
          </View>
        </View>

        {/* Report Title */}
        <Text style={styles.reportTitle}>Trip Expense Report</Text>

        {/* Trip Information */}
        <View style={styles.tripInfoContainer}>
          <Text style={styles.sectionTitle}>Trip Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Report Number:</Text>
            <Text style={styles.infoValue}>{reportNumber || `TR-${Date.now().toString().slice(-6)}`}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Report Date:</Text>
            <Text style={styles.infoValue}>{reportDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cab Number:</Text>
            <Text style={styles.infoValue}>{trip.CabDetail?.cabNumber || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trip Status:</Text>
            <View
              style={[styles.statusBadge, trip.status === "completed" ? styles.statusCompleted : styles.statusAssigned]}
            >
              <Text
                style={[
                  styles.statusText,
                  trip.status === "completed" ? styles.statusCompleted : styles.statusAssigned,
                ]}
              >
                {trip.status?.toUpperCase() || "ASSIGNED"}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned Date:</Text>
            <Text style={styles.infoValue}>{formatDate(trip.assignedAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trip Duration:</Text>
            <Text style={styles.infoValue}>{calculateDuration(trip.assignedAt, trip.completedAt)}</Text>
          </View>
        </View>

        {/* Route Information */}
        <View style={styles.routeContainer}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <View style={styles.routePoint}>
            <View style={[styles.routeIcon, styles.fromIcon]} />
            <Text style={styles.routeText}>From: {trip.CabDetail?.location_from || "N/A"}</Text>
          </View>
          <View style={styles.routePoint}>
            <View style={[styles.routeIcon, styles.toIcon]} />
            <Text style={styles.routeText}>To: {trip.CabDetail?.location_to || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Distance:</Text>
            <Text style={styles.infoValue}>{trip.CabDetail?.location_totalDistance || "0"} KM</Text>
          </View>
        </View>

        {/* Driver & Vehicle Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Driver Information</Text>
            <Text style={styles.detailsText}>Name: {trip.Driver?.name || "N/A"}</Text>
            <Text style={styles.detailsText}>License: {trip.Driver?.licenseNumber || "N/A"}</Text>
            <Text style={styles.detailsText}>Phone: {trip.Driver?.phone || "N/A"}</Text>
            <Text style={styles.detailsText}>Experience: {trip.Driver?.experience || "N/A"} years</Text>
          </View>
          <View style={styles.detailsBox}>
            <Text style={styles.detailsTitle}>Vehicle Information</Text>
            <Text style={styles.detailsText}>Model: {trip.CabDetail?.model || "N/A"}</Text>
            <Text style={styles.detailsText}>Year: {trip.CabDetail?.year || "N/A"}</Text>
            <Text style={styles.detailsText}>Fuel Type: {trip.CabDetail?.fuelType || "N/A"}</Text>
            <Text style={styles.detailsText}>Capacity: {trip.CabDetail?.seatingCapacity || "N/A"} seats</Text>
          </View>
        </View>

        {/* Expense Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Expense Category</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Amount</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Description</Text>
          </View>
          {/* Fuel Row */}
          <View style={[styles.tableRow, expenses.fuel > 0 ? {} : styles.tableRowAlt]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Fuel Expenses</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(expenses.fuel)}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Fuel consumption during trip</Text>
          </View>
          {/* FastTag Row */}
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Toll Charges (FastTag)</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(expenses.fastTag)}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Highway toll payments</Text>
          </View>
          {/* Tyre Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Tyre Maintenance</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(expenses.tyre)}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Tyre repair and maintenance</Text>
          </View>
          {/* Servicing Row */}
          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Vehicle Servicing</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(expenses.servicing)}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Regular maintenance and servicing</Text>
          </View>
          {/* Other Expenses Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Other Expenses</Text>
            <Text style={[styles.tableCellBold, { flex: 1 }]}>{formatCurrency(expenses.other)}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{formatDate(trip.assignedAt)}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Miscellaneous trip expenses</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Expense Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Fuel Expenses:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(expenses.fuel)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Toll Charges:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(expenses.fastTag)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Maintenance:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(expenses.tyre + expenses.servicing)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Other Expenses:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(expenses.other)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL TRIP EXPENSES:</Text>
            <Text style={styles.totalValue}>{formatCurrency(expenses.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              This report is generated automatically by the Fleet Management System.{"\n"}
              Report generated on: {new Date().toLocaleString("en-IN")}
              {"\n"}
              For any queries, please contact the fleet management team.{"\n\n"}
              Note: All expenses are subject to verification and approval.
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.signatureText}>Authorized By</Text>
            {signature && <Image style={styles.signature} src={signature || "/placeholder.svg"} />}
            <Text style={styles.signatureText}>Fleet Manager</Text>
            <Text style={styles.signatureText}>{companyName || "Company Name"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDF





