import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  try {
    const csv = Papa.unparse(data)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return true
  } catch (error) {
    console.error('Error exporting to CSV:', error)
    alert('Failed to export CSV')
    return false
  }
}

export const exportToPDF = (data, filename = 'export', title = 'Data Export', columns = null) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  try {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text(title, 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    let tableColumns = columns
    if (!tableColumns && data.length > 0) {
      tableColumns = Object.keys(data[0]).map((key) => ({
        header: key.charAt(0).toUpperCase() + key.slice(1),
        dataKey: key,
      }))
    }

    doc.autoTable({
      columns: tableColumns,
      body: data,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [13, 110, 253],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })

    doc.save(`${filename}.pdf`)

    return true
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    alert('Failed to export PDF')
    return false
  }
}

export const exportUserReportToPDF = (userData, stats) => {
  try {
    const doc = new jsPDF()

    doc.setFontSize(22)
    doc.setTextColor(13, 110, 253)
    doc.text('WomenCare Health Report', 14, 22)

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`User: ${userData.name}`, 14, 35)
    doc.text(`Email: ${userData.email}`, 14, 42)
    doc.text(`Role: ${userData.role}`, 14, 49)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 56)

    doc.setDrawColor(200, 200, 200)
    doc.line(14, 60, 196, 60)

    doc.setFontSize(16)
    doc.setTextColor(13, 110, 253)
    doc.text('Statistics', 14, 70)

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Health Profiles Created: ${stats.profilesCreated}`, 14, 80)
    doc.text(`Ratings Given: ${stats.ratingsGiven}`, 14, 87)
    doc.text(`Days Since Joined: ${stats.daysSinceJoined}`, 14, 94)

    const pageCount = doc.internal.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('WomenCare Platform - Confidential', 14, doc.internal.pageSize.height - 10)
    doc.text(
      `Page ${pageCount}`,
      doc.internal.pageSize.width - 24,
      doc.internal.pageSize.height - 10,
    )

    doc.save(`${userData.name}_Health_Report.pdf`)
    return true
  } catch (error) {
    console.error('Error exporting user report:', error)
    alert('Failed to export report')
    return false
  }
}

export const exportAdminReportToPDF = (adminStats, allUsers) => {
  if (!adminStats || !allUsers) {
    alert('No data to export')
    return false
  }

  try {
    const doc = new jsPDF()

    doc.setFontSize(22)
    doc.setTextColor(220, 53, 69)
    doc.text('Admin Statistics Report', 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)

    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Platform Overview', 14, 45)

    doc.setFontSize(11)
    doc.text(`Total Users: ${adminStats.totalUsers}`, 20, 55)
    doc.text(`Total Health Profiles: ${adminStats.totalProfiles}`, 20, 62)
    doc.text(`Total Ratings: ${adminStats.totalRatings}`, 20, 69)
    doc.text(`Average Rating: ${adminStats.averageRating.toFixed(2)}`, 20, 76)

    doc.setFontSize(16)
    doc.text('User List', 14, 90)

    const tableData = allUsers.map((user) => [
      user.name || 'N/A',
      user.email || 'N/A',
      user.role || 'N/A',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
    ])

    autoTable(doc, {
      startY: 95,
      head: [['Name', 'Email', 'Role', 'Joined']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [220, 53, 69],
        textColor: [255, 255, 255],
      },
    })

    doc.save('Admin_Statistics_Report.pdf')
    return true
  } catch (error) {
    console.error('Error exporting admin report:', error)
    alert('Failed to export PDF: ' + error.message)
    return false
  }
}
