import {useEffect, useState} from 'react';
import {getCountriesInfo, getOrdersInfo} from '../../api/apiService';
import {Container, Dropdown, Form, Table} from "react-bootstrap";
import '../../styles/commonStyles.css';
import { useCookies } from 'react-cookie';


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
    const listFiltered = reduced.map((item) => (
        <tr key={item.id_order}>
            <td>{item.id_order}</td>
            <td>{item.firstname} {item.lastname}</td>
            <td>{item.address1} {item.address2}</td>
            <td>{item.country}</td>
            <td>{item.product_name}</td>
            <td>{item.current_state_name}</td>
            <td>{item.date_add}</td>
        </tr>
    ));
    setProducts(listFiltered);
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

export default function GetOrdersInfo(props) {
    const [data, setData] = useState([]);
    const [products, setProducts] = useState([]);
    const [countriesFilter, setCountriesFilter] = useState(["Todos"]);
    const [countries, setCountry] = useState("Todos");
    const [allChecked, setAllChecked] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState(["2", "3"]);
    const [cookies, setCookie] = useCookies(['user']);

    const [seconds, setSeconds] = useState(0);
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
                setAllChecked(1);
            } else if (indexAll > -1) {
                statusFilter.splice(index, 1);
                setAllChecked(0);
            }
            temporalStatus = [...statusFilter, newStatus]
            setStatusFilter(statusFilter => [...statusFilter, newStatus]);
        } else {
            statusFilter.splice(index, 1);
            setStatusFilter(statusFilter);
            temporalStatus = statusFilter;
            if (newStatus === "0") {
                setAllChecked(0);
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
        let dataInfo = await getOrdersInfo();
        dataInfo = dataInfo.message;
        return Object.keys(dataInfo).length;
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

            const listCategory = dataInfo.map((item => {
                if (item.current_state === 2 || item.current_state === 3) {
                    let date = item.date_add.replaceAll("Z", " ").replaceAll("T", " ").replaceAll(".000", "");
                    return (
                        <tr key={item.id_order}>
                            <td>{item.id_order}</td>
                            <td>{item.firstname} {item.lastname}</td>
                            <td>{item.address1} {item.address2}</td>
                            <td>{item.country}</td>
                            <td>{item.product_name}</td>
                            <td>{item.current_state_name}</td>
                            <td>{date}</td>
                        </tr>
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
                                    />
                                    {status()}
                                </div>
                                <div className="d-flex justify-content-center">
                                    <b>Paises</b>
                                </div>
                                <div className="d-flex-inline justify-content-center mb-3"
                                     key={`inline-checkbox-countries`}
                                     onChange={(e) => onChangeCity(e)}>
                                    <Form.Check
                                        inline
                                        label="Todos los paises"
                                        name="Todos"
                                        type="checkbox"
                                        id={`Todos`}
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

                <div className="d-flex align-items-center justify-content-center">
                    <Table striped bordered size>
                        <thead>
                        <tr>
                            <th>Id</th>
                            <th>Cliente</th>
                            <th>Dirección</th>
                            <th width="7%">País</th>
                            <th>Productos</th>
                            <th>Estado</th>
                            <th width="10%">Fecha pedido</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products}
                        </tbody>
                    </Table>
                </div>
            </>
        );
    }

    return (
        <div>
            {useFetch()}
        </div>
    )
}