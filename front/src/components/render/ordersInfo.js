import {useEffect, useState} from 'react';
import {getCountriesInfo, getNumberOrders, getOrderInfo, getOrdersInfo, modifyOrderState} from '../../api/apiService';
import {Button, Card, Container, Dropdown, Form, Modal} from "react-bootstrap";
import BootstrapTable from 'react-bootstrap-table-next';
import '../../styles/commonStyles.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import {useCookies} from 'react-cookie';


function filterByCountry(data, temporalCities) {
    return data.reduce(function (filtered, option) {
        if (
            (temporalCities.indexOf(option.country) !== -1 || temporalCities.indexOf("Todos") !== -1)
        ) {
            filtered.push(option);
        }
        return filtered;
    }, []);
}

function formatData(reduced, setProducts) {
    setProducts(reduced);
}

function filterByName(data, nameToFilter) {
    let name;
    return data.reduce(function (filtered, option) {
        name = `${option.firstname} ${option.lastname}`
        if (
            (name.toLowerCase().includes(nameToFilter.toLowerCase(), 0) === true)) {
            filtered.push(option);
        }
        return filtered;
    }, []);
}

function filterByStatus(reduced, temporalStatus) {
    return reduced.reduce(function (filtered, option) {
        if (
            (temporalStatus.indexOf(option.current_state.toString()) !== -1 || temporalStatus.indexOf("0") !== -1)
        ) {
            filtered.push(option);
        }
        return filtered;
    }, []);
}

function formatDate(item) {
    return item.replaceAll("Z", " ")
        .replaceAll("T", " ")
        .replaceAll(".000", "");
}

export default function GetOrdersInfo(props) {
    const [data, setData] = useState([]);
    const [products, setProducts] = useState([]);
    const [countriesFilter, setCountriesFilter] = useState(["Todos"]);
    const [countries, setCountry] = useState("Todos");
    const [allChecked, setAllChecked] = useState(1);
    const [allStatusChecked, setAllStatusChecked] = useState(0);
    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState(["2", "3"]);
    const [cookies, setCookie] = useCookies(['user']);
    const [show, setShow] = useState(false);
    const [actualState, setActualState] = useState("");
    const [actualOrder, setActualOrder] = useState("");
    const [newStatus, setNewStatus] = useState("");
    const [orderInfo, setOrderInfo] = useState();
    const [errorMessage, setErrorMessage] = useState('');
    const columns = [
        { dataField: 'id_order', text: 'Id' },
        {
            dataField: "firstName",
            text: "Cliente",
            formatter: (cell, row) => {
                return <div>{row['firstname'] + " " + row['lastname']}</div>;
            }
        },
        {
            dataField: "address1",
            text: "Dirección",
            formatter: (cell, row) => {
                return <div>{row['address1'] + " " + row['address2']}</div>;
            }
        },
        { dataField: 'country', text: 'País'},
        { dataField: 'product_name', text: 'Productos'},
        { dataField: 'current_state_name', text: 'Estado'},
        {
            dataField: "date_add",
            text: "Fecha pedido",
            formatter: (cell, row) => {
                return <div>{formatDate(row['date_add'])}</div>;
            }
        },
    ];
    const pagination = paginationFactory({
        page: 1,
        sizePerPage: 50,
        lastPageText: '>>',
        firstPageText: '<<',
        nextPageText: '>',
        prePageText: '<',
        showTotal: true,
        alwaysShowAllBtns: true,
    });
    const rowEvents = {
        onClick: (e, row, rowIndex) => {
            handleShow(row.id_order);
        }
    };

    const saveChanges = async () => {
        if (newStatus === "" || newStatus === actualState) {
            handleClose();
        } else {
            try {
                const serverResponse = await modifyOrderState(newStatus, actualOrder);
                if (errorMessage.length > 0) {
                    setErrorMessage('');
                }
                if (serverResponse.status === 200) {
                    setErrorMessage('');
                    window.location.reload();
                }
                if (serverResponse.status !== 200) {
                    setErrorMessage('Ha habido un error, es posible que falten campos');
                }
            } catch (error) {
                setErrorMessage('');
                setErrorMessage('error');
            }
        }
    }

    const setNewStatusAction = (event) => {
        setNewStatus(event.target.value);
    }

    const handleClose = () => setShow(false);
    const handleShow = async (value) => {
        let orderInfo = await getOrderInfo(value);
        orderInfo = orderInfo.message;
        if (orderInfo.length > 0) {
            orderInfo = orderInfo[0];
            setActualOrder(orderInfo.id_order);
            setActualState(orderInfo.current_state);
            orderInfo =
                <div>
                    <Card>
                        <Card.Header as="h5">Pedido: {orderInfo.id_order}</Card.Header>
                        <Card.Body>
                            <Card.Title>Cliente</Card.Title>
                            <Card.Text>
                                {orderInfo.firstname} {orderInfo.lastname}
                            </Card.Text>
                            <Card.Title>Dirección</Card.Title>
                            <Card.Text>
                                {orderInfo.address1} {orderInfo.address2}
                            </Card.Text>
                            <Card.Title>País</Card.Title>
                            <Card.Text>
                                {orderInfo.country}
                            </Card.Text>
                            <Card.Title>Productos</Card.Title>
                            <Card.Text>
                                {orderInfo.product_name}
                            </Card.Text>
                            <Card.Title>Estado del pedido</Card.Title>
                            <Card.Text>
                                <div onChange={(e) => setNewStatusAction(e)}>
                                    <Form.Select aria-label="Default select example">
                                        <option value={orderInfo.current_state_name}>{orderInfo.current_state_name}</option>
                                        {setStatusOptions(orderInfo.current_state)}
                                    </Form.Select>
                                </div>
                            </Card.Text>
                            <Card.Title>Fecha del pedido</Card.Title>
                            <Card.Text>
                                {formatDate(orderInfo.date_add)}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            setOrderInfo(orderInfo);
            setShow(true);
        }
    }

    const orderStatus = {
        'Pago pendiente': '1',
        'Pago aceptado': '2',
        'Preparación en proceso': '3',
        'Enviado': '4',
        'Entregado': '5',
        'Cancelado': '6',
        'Reembolso': '7',
        'Error en el pago': '8'
    };

    const setStatusOptions = (actualStatus) => {
        const statusList = Object.entries(orderStatus).map((item => {
            if (item[1] !== actualStatus.toString()) {
                return (
                    <option value={item[1]}>{item[0]}</option>
                )
            }
        }));
        return <>{statusList}</>

    }

    const status = () => {
        let defaultChecked = 0;

        const statusList = Object.entries(orderStatus).map((item => {
            if (item[1] === '2' || item[1] === '3') defaultChecked = 1;
            else defaultChecked = 0;
            return (
                <Form.Check
                    inline
                    label={item[0]}
                    name={item[0]}
                    type="checkbox"
                    id={item[1]}
                    defaultChecked={defaultChecked}
                />)
        }));

        return <>{statusList}</>;
    }
    const onChangeCity = (event) => {
        const city = event.target.name;
        const index = countriesFilter.indexOf(city);
        const indexAll = countriesFilter.indexOf("Todos");
        let temporalCountries;
        if (index === -1) {
            if (city === "Todos") {
                setAllChecked(1);
            } else if (indexAll > -1) {
                countriesFilter.splice(index, 1);
                setAllChecked(0);
            }
            temporalCountries = [...countriesFilter, city]
            setCountriesFilter(countriesFilter => [...countriesFilter, city]);
        } else {
            countriesFilter.splice(index, 1);
            setCountriesFilter(countriesFilter);
            temporalCountries = countriesFilter;
            if (city === "Todos") {
                setAllChecked(0);
            }
        }
        let reduced = filterByName(data, nameFilter);
        reduced = filterByStatus(reduced, statusFilter);
        reduced = filterByCountry(reduced, temporalCountries);
        formatData(reduced, setProducts);
    };
    const onChangeStatus = (event) => {
        const newStatus = event.target.id;
        const index = statusFilter.indexOf(newStatus);
        const indexAll = statusFilter.indexOf("0");
        let temporalStatus;
        if (index === -1) {
            if (newStatus === "0") {
                setAllStatusChecked(1);
            } else if (indexAll > -1) {
                statusFilter.splice(index, 1);
                setAllStatusChecked(0);
            }
            temporalStatus = [...statusFilter, newStatus]
            setStatusFilter(statusFilter => [...statusFilter, newStatus]);
        } else {
            statusFilter.splice(index, 1);
            setStatusFilter(statusFilter);
            temporalStatus = statusFilter;
            if (newStatus === "0") {
                setAllStatusChecked(0);
            }
        }
        let reduced = filterByName(data, nameFilter);
        reduced = filterByCountry(reduced, countriesFilter);
        reduced = filterByStatus(reduced, temporalStatus);

        formatData(reduced, setProducts);
    }

    const onChangeSearcher = (event) => {
        let reduced = filterByCountry(data, countriesFilter);
        reduced = filterByStatus(reduced, statusFilter);
        reduced = filterByName(reduced, event.target.value);
        formatData(reduced, setProducts);
        setNameFilter(event.target.value);
    }

    async function updateDataFetch() {
        let dataInfo = await getNumberOrders();
        dataInfo = dataInfo.message;
        return dataInfo[0].numberOrders;
    }

    function useFetch() {
        async function getData() {
            let countriesInfo = await getCountriesInfo();
            countriesInfo = countriesInfo.message;
            let dataInfo = await getOrdersInfo();
            dataInfo = dataInfo.message;

            const countriesList = countriesInfo.map((item) => (
                <Form.Check
                    inline
                    label={item.country}
                    name={item.country}
                    type="checkbox"
                    id={item.country}
                />
            ));

            const listCategory = dataInfo.filter((item => {
                if (item.current_state === 2 || item.current_state === 3) {
                    return (
                        item
                    )
                }
            }));

            setData(dataInfo);
            setProducts(listCategory);
            setCountry(countriesList);
        }

        useEffect(() => {
            getData();
        }, [])

        useEffect(() => {
            async function updateData() {
                const orders = await updateDataFetch();
                if(orders !== parseInt(cookies.orders)){
                    getData();
                    setCookie("orders", orders);
                }

            }
            const interval = setInterval(() => {
                updateData()
            }, 1000);

            return () => clearInterval(interval);
        }, []);
        return (
            <>
                <Dropdown>
                    <Dropdown.Toggle variant="light" id="dropdown-basic">
                        Filtros
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Container>
                            <Form>
                                <div className="d-flex justify-content-center">
                                    <b>Estados de los pedidos</b>
                                </div>
                                <div className="d-flex-inline justify-content-center mb-3"
                                     key={`inline-checkbox-states`} onChange={(e) => onChangeStatus(e)}>
                                    <Form.Check
                                        inline
                                        label="Todos los estados"
                                        name="Todos"
                                        type="checkbox"
                                        id="0"
                                        checked={allStatusChecked}
                                    />
                                    {status()}
                                </div>
                                <div className="d-flex justify-content-center">
                                    <b>Países</b>
                                </div>
                                <div className="d-flex-inline justify-content-center mb-3"
                                     key={`inline-checkbox-countries`}
                                     onChange={(e) => onChangeCity(e)}>
                                    <Form.Check
                                        inline
                                        label="Todos los paises"
                                        name="Todos"
                                        type="checkbox"
                                        id="Todos"
                                        checked={allChecked}
                                    />
                                    {countries}
                                </div>
                            </Form>
                        </Container>
                    </Dropdown.Menu>
                </Dropdown>
                <div className="form-group">
                    <input
                        placeholder="Filtrar por nombre"
                        type="text"
                        className="form-control"
                        id="formGroupExampleInput"
                        onChange={(e) => onChangeSearcher(e)}
                    />
                </div>
                <BootstrapTable keyField='id' data={products} columns={columns} rowEvents={rowEvents} pagination={pagination} />
            </>
        );
    }

    return (
        <div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Información del producto</Modal.Title>
                </Modal.Header>
                <Modal.Body>{orderInfo}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                    <Button variant="primary" onClick={saveChanges}>
                        Guardar cambios
                    </Button>
                    {errorMessage.length > 0 && <p className="error">{errorMessage}</p>}
                </Modal.Footer>
            </Modal>
            {useFetch()}
        </div>
    )
}