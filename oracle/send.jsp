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
           String url=" jdbc:oracle:thin:211.206.124.178:1533:R3DEV" ;
           String userName="r3sys" ;
           String passWord="bsgr3sys01" ;
           Connection con = DriverManager.getConnection(url,userName,passWord);
           Statement st = con.createStatement();
           //데이터 입력받아서 sql에 넣기
           String sql="insert into general(gname , gage , gmoney) values(
            ' "+request.getParameter("name")+" ',"+ request.getParameter("age") +","+ request.getParameter("salary") +" )";

            st.executeUpdate(sql);
            con.close();
            st.close();

       } catch (Exception e) {
            System.out.println(e);
       }

%>

</body>
</html>