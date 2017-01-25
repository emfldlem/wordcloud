<%@ page
    language="java"
    contentType="text/html; charset=EUC-KR"
    pageEncoding="EUC-KR"
    import="java.sql.*"
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=EUC-KR">
<title>DB로 데이터 보내기</title>
</head>
<body>
<%
      try {
           String driver="oracle.jdbc.driver.OracleDriver";
           Class.forName(driver);
           String url=" jdbc:oracle:thin:@211.206.124.178:1533:R3DEV";
           String userName="r3sys";
           String passWord="bsgr3sys01";
           Connection con = DriverManager.getConnection(url,userName,passWord);
           Statement st = con.createStatement();
            //sql안의 데이터 보여주기
             String sql2="select * from T_PO_COMPANY_MST";
             ResultSet rs = st.executeQuery(sql2);

              alert(rs);
             while(rs.next()){
             String s1 = rs.getString("CMPNY_CD");
             String s2 = rs.getLong("CMPNY_NM");


             String strXML=" ";
             strXML+="<general>";
             strXML+=	"<person>";
             strXML+=	"<name>"+ s1 +"</name>";
             strXML+=	"<age>"+ s2 +"</age>";
             strXML+=	"</person>";
             strXML+="</general>";
             System.out.println(e);
             out.write(strXML);

          } catch (Exception e) {
                   System.out.println(e);
         }
       }

%>

</body>
</html>
